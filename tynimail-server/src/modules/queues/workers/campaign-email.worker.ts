import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Knex } from 'knex';
import { TABLES, CAMPAIGN_STATUS, CAMPAIGN_SEND_STATUS } from '@/constants';
import { PostmarkService } from '@/modules/postmark/postmark.service';
import type { CampaignEmailJobData } from '../producers/campaign-email-queue.producer';

@Processor('campaign-email-queue', {
  concurrency: 50,
  limiter: { max: 25, duration: 1000 },
})
export class CampaignEmailWorker extends WorkerHost {
  private readonly logger = new Logger(CampaignEmailWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly postmarkService: PostmarkService,
  ) {
    super();
  }

  async process(job: Job<CampaignEmailJobData>): Promise<void> {
    const { campaignId, subscriberId, userId } = job.data;

    // Fetch campaign with template content and sender email
    const campaign = await this.knex(TABLES.CAMPAIGNS)
      .select(
        'tbl_campaigns.*',
        'tbl_sender_emails.email as from_email',
        'tbl_user_templates.content as template_content',
      )
      .join(
        'tbl_sender_emails',
        'tbl_campaigns.sender_email_id',
        'tbl_sender_emails.id',
      )
      .leftJoin(
        'tbl_user_templates',
        'tbl_campaigns.template_id',
        'tbl_user_templates.id',
      )
      .where('tbl_campaigns.id', campaignId)
      .first();

    if (!campaign) {
      this.logger.error(
        `[CAMPAIGN-EMAIL-WORKER] Campaign ${campaignId} not found`,
      );
      return;
    }

    // Fetch subscriber
    const subscriber = await this.knex(TABLES.SUBSCRIBERS)
      .where({ id: subscriberId, user_id: userId })
      .first();

    // Safety check 1 — subscriber exists and is active
    if (!subscriber || subscriber.row_status !== 1) {
      await this.markSkipped(
        campaignId,
        subscriberId,
        'Subscriber not found or inactive',
      );
      await this.incrementCounter(campaignId, 'failed_count');
      return;
    }

    // Safety check 2 — not unsubscribed
    if (subscriber.status !== 1) {
      await this.markSkipped(
        campaignId,
        subscriberId,
        'Subscriber is unsubscribed',
      );
      await this.incrementCounter(campaignId, 'failed_count');
      return;
    }

    // Safety check 3 — not hard bounced
    if (subscriber.hard_bounce) {
      await this.markSkipped(
        campaignId,
        subscriberId,
        'Subscriber has hard bounced',
      );
      await this.incrementCounter(campaignId, 'failed_count');
      return;
    }

    // Safety check 4 — not on blocklist
    const isBlocked = await this.knex(TABLES.CONTACT_BLOCKLIST)
      .where({ contact_id: subscriberId })
      .first();

    if (isBlocked) {
      await this.markSkipped(
        campaignId,
        subscriberId,
        'Subscriber is on blocklist',
      );
      await this.incrementCounter(campaignId, 'failed_count');
      return;
    }

    // Interpolate variables in subject and HTML body
    const contactData = {
      ...subscriber,
      firstName: subscriber.first_name,
      lastName: subscriber.last_name,
      attributes: subscriber.metadata?.attributes || {},
    };

    const subject = this.postmarkService.interpolateVariables(
      campaign.subject,
      contactData,
    );
    const htmlBody = this.postmarkService.interpolateVariables(
      campaign.template_content || '',
      contactData,
    );

    try {
      const { sentEmail } = await this.postmarkService.sendAndTrackEmail({
        userId,
        contactId: subscriberId,
        toEmail: subscriber.email,
        fromEmail: campaign.from_email,
        fromName: campaign.sender_name,
        subject,
        htmlBody,
        previewText: campaign.preheader_text || undefined,
        metadata: { campaignId, userId },
      });

      // Mark send as successful
      await this.knex(TABLES.CAMPAIGN_SENDS)
        .where({ campaign_id: campaignId, subscriber_id: subscriberId })
        .update({
          status: CAMPAIGN_SEND_STATUS.SENT,
          sent_email_id: sentEmail.id,
          updated_at: this.knex.fn.now(),
        });

      await this.incrementCounter(campaignId, 'sent_count');

      this.logger.log(
        `[CAMPAIGN-EMAIL-WORKER] Sent to ${subscriber.email} for campaign=${campaignId}`,
      );
    } catch (error) {
      this.logger.error(
        `[CAMPAIGN-EMAIL-WORKER] Failed to send to ${subscriber.email} for campaign=${campaignId}: ${error.message}`,
      );

      await this.knex(TABLES.CAMPAIGN_SENDS)
        .where({ campaign_id: campaignId, subscriber_id: subscriberId })
        .update({
          status: CAMPAIGN_SEND_STATUS.FAILED,
          error_message: error.message,
          updated_at: this.knex.fn.now(),
        });

      await this.incrementCounter(campaignId, 'failed_count');

      throw error;
    }
  }

  private async markSkipped(
    campaignId: string,
    subscriberId: string,
    reason: string,
  ): Promise<void> {
    await this.knex(TABLES.CAMPAIGN_SENDS)
      .where({ campaign_id: campaignId, subscriber_id: subscriberId })
      .update({
        status: CAMPAIGN_SEND_STATUS.SKIPPED,
        error_message: reason,
        updated_at: this.knex.fn.now(),
      });

    this.logger.log(
      `[CAMPAIGN-EMAIL-WORKER] Skipped subscriber=${subscriberId}: ${reason}`,
    );
  }

  /**
   * Atomically increment a counter and check if the campaign is complete.
   * Uses PostgreSQL atomic UPDATE ... RETURNING to avoid race conditions
   * across 50 concurrent workers.
   */
  private async incrementCounter(
    campaignId: string,
    column: 'sent_count' | 'failed_count',
  ): Promise<void> {
    const result = await this.knex.raw<{
      rows: Array<{
        sent_count: number;
        failed_count: number;
        total_recipients: number;
      }>;
    }>(
      `UPDATE tbl_campaigns
             SET ?? = ?? + 1, updated_at = NOW()
             WHERE id = ?
             RETURNING sent_count, failed_count, total_recipients`,
      [column, column, campaignId],
    );

    const row = result.rows[0];
    if (!row) return;

    const processed = row.sent_count + row.failed_count;

    if (row.total_recipients > 0 && processed >= row.total_recipients) {
      await this.knex(TABLES.CAMPAIGNS).where({ id: campaignId }).update({
        campaign_status: CAMPAIGN_STATUS.COMPLETED,
        updated_at: this.knex.fn.now(),
      });

      this.logger.log(
        `[CAMPAIGN-EMAIL-WORKER] Campaign=${campaignId} COMPLETED (${row.sent_count} sent, ${row.failed_count} failed)`,
      );
    }
  }
}
