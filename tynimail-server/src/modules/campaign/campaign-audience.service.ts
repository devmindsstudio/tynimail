import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { TABLES, AUDIENCE_TYPE, AudienceType } from '@/constants';

@Injectable()
export class CampaignAudienceService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

    async addAudience(
        campaignId: string,
        audienceType: AudienceType,
        referenceId: string,
    ): Promise<any> {
        const [audience] = await this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .insert({
                campaign_id: campaignId,
                audience_type: audienceType,
                segment_id: audienceType === AUDIENCE_TYPE.SEGMENT ? referenceId : null,
                subscriber_id: audienceType === AUDIENCE_TYPE.SUBSCRIBER ? referenceId : null,
            })
            .returning('*');

        return audience;
    }

    async getAudiencesByCampaignId(campaignId: string): Promise<any[]> {
        // Fetch segment-type audiences (audience_type = 0) with segment details + subscriber count
        const segmentAudiences = await this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .select(
                `${TABLES.CAMPAIGN_AUDIENCES}.id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.audience_type`,
                `${TABLES.CAMPAIGN_AUDIENCES}.segment_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.subscriber_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.created_at`,
                `${TABLES.SEGMENTS}.name`,
                `${TABLES.SEGMENTS}.color`,
                this.knex.raw('COUNT(tbl_subscriber_segment.id)::int AS subscriber_count'),
            )
            .join(TABLES.SEGMENTS, `${TABLES.CAMPAIGN_AUDIENCES}.segment_id`, `${TABLES.SEGMENTS}.id`)
            .leftJoin(TABLES.SUBSCRIBER_SEGMENT, `${TABLES.SEGMENTS}.id`, `${TABLES.SUBSCRIBER_SEGMENT}.segment_id`)
            .where(`${TABLES.CAMPAIGN_AUDIENCES}.campaign_id`, campaignId)
            .andWhere(`${TABLES.CAMPAIGN_AUDIENCES}.audience_type`, AUDIENCE_TYPE.SEGMENT)
            .groupBy(
                `${TABLES.CAMPAIGN_AUDIENCES}.id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.audience_type`,
                `${TABLES.CAMPAIGN_AUDIENCES}.segment_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.subscriber_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.created_at`,
                `${TABLES.SEGMENTS}.name`,
                `${TABLES.SEGMENTS}.color`,
            );

        // Fetch subscriber-type audiences (audience_type = 1) with subscriber details
        const subscriberAudiences = await this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .select(
                `${TABLES.CAMPAIGN_AUDIENCES}.id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.audience_type`,
                `${TABLES.CAMPAIGN_AUDIENCES}.segment_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.subscriber_id`,
                `${TABLES.CAMPAIGN_AUDIENCES}.created_at`,
                this.knex.raw(
                    `CONCAT(tbl_subscribers.first_name, ' ', tbl_subscribers.last_name) AS name`,
                ),
                `${TABLES.SUBSCRIBERS}.email`,
                this.knex.raw('NULL::integer AS subscriber_count'),
                this.knex.raw('NULL::varchar AS color'),
            )
            .join(TABLES.SUBSCRIBERS, `${TABLES.CAMPAIGN_AUDIENCES}.subscriber_id`, `${TABLES.SUBSCRIBERS}.id`)
            .where(`${TABLES.CAMPAIGN_AUDIENCES}.campaign_id`, campaignId)
            .andWhere(`${TABLES.CAMPAIGN_AUDIENCES}.audience_type`, AUDIENCE_TYPE.SUBSCRIBER);

        return [...segmentAudiences, ...subscriberAudiences].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
    }

    async getAudienceById(audienceId: string, campaignId: string): Promise<any> {
        return this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .where({ id: audienceId, campaign_id: campaignId })
            .first();
    }

    async removeAudience(audienceId: string, campaignId: string): Promise<boolean> {
        const deleted = await this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .where({ id: audienceId, campaign_id: campaignId })
            .delete();

        return deleted > 0;
    }

    async isAlreadyAdded(
        campaignId: string,
        audienceType: AudienceType,
        referenceId: string,
    ): Promise<boolean> {
        const existing = await this.knex(TABLES.CAMPAIGN_AUDIENCES)
            .where({ campaign_id: campaignId, audience_type: audienceType })
            .andWhere(
                audienceType === AUDIENCE_TYPE.SEGMENT
                    ? { segment_id: referenceId }
                    : { subscriber_id: referenceId },
            )
            .first();

        return !!existing;
    }

    async verifySegmentOwnership(segmentId: string, userId: string): Promise<boolean> {
        const segment = await this.knex(TABLES.SEGMENTS)
            .where({ id: segmentId, user_id: userId, row_status: 1 })
            .first();

        return !!segment;
    }

    async verifySubscriberOwnership(subscriberId: string, userId: string): Promise<boolean> {
        const subscriber = await this.knex(TABLES.SUBSCRIBERS)
            .where({ id: subscriberId, user_id: userId, row_status: 1 })
            .first();

        return !!subscriber;
    }

    /**
     * Count total unique recipients across all audience entries for a campaign.
     * Expands segments to their subscriber lists and deduplicates.
     */
    async getUniqueRecipientCount(campaignId: string): Promise<number> {
        const result = await this.knex.raw<{ rows: [{ total: string }] }>(
            `
            SELECT COUNT(DISTINCT subscriber_id)::int AS total
            FROM (
                -- Subscribers directly added (audience_type = 1)
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
            WHERE sub.row_status = 1
              AND sub.status = 1
            `,
            [campaignId, AUDIENCE_TYPE.SUBSCRIBER, campaignId, AUDIENCE_TYPE.SEGMENT],
        );

        return parseInt(result.rows[0]?.total ?? '0', 10);
    }
}
