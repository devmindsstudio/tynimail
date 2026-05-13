import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { TABLES } from '@/constants';
import { RECORD_STATUS } from '@/constants/common.constants';

@Injectable()
export class CampaignService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async getCampaignsByUserId(userId: string): Promise<any[]> {
    const campaigns = await this.knex(TABLES.CAMPAIGNS)
      .select(
        'tbl_campaigns.id',
        'tbl_campaigns.name',
        'tbl_campaigns.subject',
        'tbl_campaigns.type',
        'tbl_campaigns.created_at',
        'tbl_campaigns.updated_at',
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
      .where('tbl_campaigns.user_id', userId)
      .whereNot('tbl_campaigns.status', RECORD_STATUS.DELETED)
      .orderBy('tbl_campaigns.created_at', 'desc');

    return campaigns;
  }

  async getCampaignById(campaignId: string, userId: string): Promise<any> {
    const campaign = await this.knex(TABLES.CAMPAIGNS)
      .select(
        'tbl_campaigns.*',
        'tbl_sender_emails.email as sender_email',
        'tbl_templates.type as template_type',
        'tbl_user_templates.content as template_content',
        'tbl_user_templates.id as template_id',
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
      .leftJoin(
        'tbl_templates',
        'tbl_user_templates.template_id',
        'tbl_templates.id',
      )
      .where({
        'tbl_campaigns.id': campaignId,
        'tbl_campaigns.user_id': userId,
      })
      .whereNot('tbl_campaigns.status', RECORD_STATUS.DELETED)
      .first();

    return campaign;
  }

  async verifySenderEmailOwnership(
    senderEmailId: string,
    userId: string,
  ): Promise<boolean> {
    const senderEmail = await this.knex(TABLES.SENDER_EMAILS)
      .where({ id: senderEmailId, user_id: userId })
      .first();

    return !!senderEmail;
  }

  async verifyUserTemplateOwnership(
    userTemplateId: string,
    userId: string,
  ): Promise<boolean> {
    const userTemplate = await this.knex(TABLES.USER_TEMPLATES)
      .where({
        id: userTemplateId,
        user_id: userId,
        status: RECORD_STATUS.ACTIVE,
      })
      .whereNull('deleted_at')
      .first();

    return !!userTemplate;
  }

  async verifyCampaignOwnership(
    campaignId: string,
    userId: string,
  ): Promise<boolean> {
    const campaign = await this.knex(TABLES.CAMPAIGNS)
      .where({ id: campaignId, user_id: userId })
      .whereNot('status', RECORD_STATUS.DELETED)
      .first();

    return !!campaign;
  }

  async createCampaign(data: any): Promise<any> {
    const [campaign] = await this.knex(TABLES.CAMPAIGNS)
      .insert({
        user_id: data.userId,
        name: data.name,
        sender_name: data.senderName,
        subject: data.subject,
        preheader_text: data.preheaderText || null,
        sender_email_id: data.senderEmailId,
        type: data.type,
        campaign_status: data.campaignStatus,
        template_id: data.templateId ?? null, // tbl_user_templates.id (optional)
      })
      .returning('*');

    return campaign;
  }

  async updateCampaign(
    campaignId: string,
    userId: string,
    data: any,
  ): Promise<any> {
    const [campaign] = await this.knex(TABLES.CAMPAIGNS)
      .where({
        id: campaignId,
        user_id: userId,
      })
      .update({
        name: data.name,
        subject: data.subject,
        preheader_text: data.preheaderText,
        type: data.type,
        status: data.status,
        template_id: data.templateId, // tbl_user_templates.id
        sender_email_id: data.senderEmailId,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return campaign;
  }

  async deleteCampaign(campaignId: string, userId: string): Promise<boolean> {
    const deleted = await this.knex(TABLES.CAMPAIGNS)
      .update({
        status: RECORD_STATUS.DELETED,
        updated_at: this.knex.fn.now(),
        deleted_at: this.knex.fn.now(),
      })
      .where({
        id: campaignId,
        user_id: userId,
        status: RECORD_STATUS.ACTIVE,
      });

    return deleted > 0;
  }

  async setInQueue(campaignId: string): Promise<any> {
    const [campaign] = await this.knex(TABLES.CAMPAIGNS)
      .where({ id: campaignId })
      .update({
        campaign_status: 1, // IN_QUEUE
        type: 1, // LIVE
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return campaign;
  }

  async getRunningCampaignCount(userId: string): Promise<number> {
    const result = await this.knex(TABLES.CAMPAIGNS)
      .where({ user_id: userId })
      .whereIn('campaign_status', [1, 2]) // IN_QUEUE or RUNNING
      .whereNot('status', 0) // not deleted
      .count('id as count')
      .first();

    return parseInt(String(result?.count ?? 0), 10);
  }

  async hasLinkedTemplate(campaignId: string): Promise<boolean> {
    const campaign = await this.knex(TABLES.CAMPAIGNS)
      .join(
        TABLES.USER_TEMPLATES,
        'tbl_campaigns.template_id',
        'tbl_user_templates.id',
      )
      .where('tbl_campaigns.id', campaignId)
      .whereNull('tbl_user_templates.deleted_at')
      .where('tbl_user_templates.status', 1)
      .first();

    return !!campaign;
  }

  async hasVerifiedSenderEmail(campaignId: string): Promise<boolean> {
    const campaign = await this.knex(TABLES.CAMPAIGNS)
      .join(
        TABLES.SENDER_EMAILS,
        'tbl_campaigns.sender_email_id',
        'tbl_sender_emails.id',
      )
      .where('tbl_campaigns.id', campaignId)
      .where('tbl_sender_emails.is_verified', true)
      .first();

    return !!campaign;
  }

  async getCampaignSends(
    campaignId: string,
    page: number,
    limit: number,
  ): Promise<{ sends: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const [sends, countResult] = await Promise.all([
      this.knex(TABLES.CAMPAIGN_SENDS)
        .select(
          'tbl_campaign_sends.id',
          'tbl_campaign_sends.subscriber_id',
          'tbl_campaign_sends.status',
          'tbl_campaign_sends.error_message',
          'tbl_campaign_sends.created_at',
          'tbl_subscribers.email',
          'tbl_subscribers.first_name',
          'tbl_subscribers.last_name',
        )
        .join(
          TABLES.SUBSCRIBERS,
          'tbl_campaign_sends.subscriber_id',
          'tbl_subscribers.id',
        )
        .where('tbl_campaign_sends.campaign_id', campaignId)
        .orderBy('tbl_campaign_sends.created_at', 'asc')
        .limit(limit)
        .offset(offset),

      this.knex(TABLES.CAMPAIGN_SENDS)
        .where({ campaign_id: campaignId })
        .count('id as count')
        .first(),
    ]);

    return {
      sends,
      total: parseInt(String(countResult?.count ?? 0), 10),
    };
  }

  async getCampaignStats(userId: string): Promise<any> {
    const stats = await this.knex(TABLES.CAMPAIGNS)
      .select(
        this.knex.raw('COUNT(*) as total_campaigns'),
        this.knex.raw(
          'COUNT(CASE WHEN status = 0 THEN 1 END) as draft_campaigns',
        ),
        this.knex.raw(
          'COUNT(CASE WHEN status = 1 THEN 1 END) as active_campaigns',
        ),
        this.knex.raw(
          'COUNT(CASE WHEN status = 2 THEN 1 END) as completed_campaigns',
        ),
      )
      .where('user_id', userId)
      .first();

    return stats;
  }

  async createCampaignSchedule(
    campaignId: string,
    date: string,
  ): Promise<string> {
    const [campaignSchedule]: string[] = await this.knex(
      TABLES.CAMPAIGN_SCHEDULES,
    )
      .insert({
        campaign_id: campaignId,
        date: date,
      })
      .returning(['id', 'campaign_id', 'date', 'status']);

    return campaignSchedule;
  }

  // async getCampaignSchedulesWhereTimeNowMinus5Mins(): Promise<any> {
  //     const [campaignSchedules]: string[] = await this.knex(TABLES.CAMPAIGN_SCHEDULES)
  //         .select('id', 'campaign_id', 'date')
  //         .whereRaw("date >= NOW() - INTERVAL '5 minutes';")

  //     return campaignSchedules;
  // }
}
