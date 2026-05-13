import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Knex } from 'knex';
import {
  TABLES,
  CAMPAIGN_STATUS,
  AUDIENCE_TYPE,
  CAMPAIGN_SEND_STATUS,
} from '@/constants';
import {
  CampaignEmailQueueProducer,
  CampaignEmailJobData,
} from '../producers/campaign-email-queue.producer';
import type { CampaignJobData } from '../producers/campaign-queue.producer';

const BATCH_SIZE = 500;

@Processor('campaign-queue')
export class CampaignWorker extends WorkerHost {
  private readonly logger = new Logger(CampaignWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly campaignEmailQueueProducer: CampaignEmailQueueProducer,
  ) {
    super();
  }

  async process(job: Job<CampaignJobData>): Promise<void> {
    const { campaignId, userId } = job.data;

    this.logger.log(
      `[CAMPAIGN-WORKER] Starting campaign=${campaignId} user=${userId}`,
    );

    await this.knex(TABLES.CAMPAIGNS).where({ id: campaignId }).update({
      campaign_status: CAMPAIGN_STATUS.RUNNING,
      updated_at: this.knex.fn.now(),
    });

    try {
      const subscriberIds = await this.resolveUniqueSubscribers(
        campaignId,
        userId,
      );

      if (subscriberIds.length === 0) {
        this.logger.warn(
          `[CAMPAIGN-WORKER] No eligible subscribers for campaign=${campaignId}`,
        );
        await this.knex(TABLES.CAMPAIGNS).where({ id: campaignId }).update({
          campaign_status: CAMPAIGN_STATUS.COMPLETED,
          updated_at: this.knex.fn.now(),
        });
        return;
      }

      await this.knex(TABLES.CAMPAIGNS).where({ id: campaignId }).update({
        total_recipients: subscriberIds.length,
        updated_at: this.knex.fn.now(),
      });

      this.logger.log(
        `[CAMPAIGN-WORKER] ${subscriberIds.length} unique recipients for campaign=${campaignId}`,
      );

      // Insert tbl_campaign_sends rows and enqueue delivery jobs in batches
      for (let i = 0; i < subscriberIds.length; i += BATCH_SIZE) {
        const batch = subscriberIds.slice(i, i + BATCH_SIZE);

        // Bulk insert send tracking rows — ignore conflicts (idempotency)
        await this.knex(TABLES.CAMPAIGN_SENDS)
          .insert(
            batch.map((subscriberId) => ({
              campaign_id: campaignId,
              subscriber_id: subscriberId,
              status: CAMPAIGN_SEND_STATUS.PENDING,
            })),
          )
          .onConflict(['campaign_id', 'subscriber_id'])
          .ignore();

        // Enqueue delivery jobs for this batch
        const jobs: CampaignEmailJobData[] = batch.map((subscriberId) => ({
          campaignId,
          subscriberId,
          userId,
        }));

        await this.campaignEmailQueueProducer.enqueueBulk(jobs);

        this.logger.log(
          `[CAMPAIGN-WORKER] Enqueued batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} jobs) for campaign=${campaignId}`,
        );
      }

      this.logger.log(
        `[CAMPAIGN-WORKER] All jobs enqueued for campaign=${campaignId}`,
      );
    } catch (error) {
      this.logger.error(
        `[CAMPAIGN-WORKER] Fatal error for campaign=${campaignId}: ${error.message}`,
        error.stack,
      );

      await this.knex(TABLES.CAMPAIGNS).where({ id: campaignId }).update({
        campaign_status: CAMPAIGN_STATUS.PENDING,
        updated_at: this.knex.fn.now(),
      });

      throw error;
    }
  }

  /**
   * Resolve all unique eligible subscriber IDs across all audience entries.
   * Expands segments to their subscriber lists and deduplicates.
   * Only includes active, subscribed subscribers.
   */
  private async resolveUniqueSubscribers(
    campaignId: string,
    userId: string,
  ): Promise<string[]> {
    const result = await this.knex.raw<{
      rows: Array<{ subscriber_id: string }>;
    }>(
      `
            SELECT DISTINCT combined.subscriber_id
            FROM (
                -- Directly added subscribers (audience_type = 1)
                SELECT ca.subscriber_id
                FROM tbl_campaign_audiences ca
                WHERE ca.campaign_id = ?
                  AND ca.audience_type = ?
                  AND ca.subscriber_id IS NOT NULL

                UNION

                -- Subscribers from linked segments (audience_type = 0)
                SELECT ss.subscriber_id
                FROM tbl_campaign_audiences ca
                JOIN tbl_subscriber_segment ss ON ss.segment_id = ca.segment_id
                WHERE ca.campaign_id = ?
                  AND ca.audience_type = ?
            ) AS combined
            JOIN tbl_subscribers sub ON sub.id = combined.subscriber_id
            WHERE sub.user_id = ?
              AND sub.row_status = 1
              AND sub.status = 1
              AND sub.hard_bounce = false
            `,
      [
        campaignId,
        AUDIENCE_TYPE.SUBSCRIBER,
        campaignId,
        AUDIENCE_TYPE.SEGMENT,
        userId,
      ],
    );

    return result.rows.map((r) => r.subscriber_id);
  }
}
