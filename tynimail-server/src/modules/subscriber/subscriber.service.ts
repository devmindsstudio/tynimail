import { Knex } from "knex";
import { TABLES, BATCH_INSERT_SIZE } from "@/constants";
import { Injectable, Inject } from "@nestjs/common";
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SubscriberService {
    private validatorAxios: AxiosInstance;

    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
        this.validatorAxios = axios.create({
            baseURL: 'https://validator.tynimail.com',
            timeout: 10000,
        });
    }
    async addBulkSubscribers(subscribers: any[], userId: string): Promise<string[]> {
        if (subscribers.length === 0) return [];

        // Extract emails from subscribers
        const emails = subscribers.map(sub => sub.email);

        // Find existing emails in database for this user
        const existingEmails = await this.knex(TABLES.SUBSCRIBERS)
            .select('email')
            .where('user_id', userId)
            .whereIn('email', emails)
            .pluck('email');

        // Filter out subscribers with existing emails
        const newSubscribers = subscribers.filter(sub => !existingEmails.includes(sub.email)).map(sub => ({
            ...sub,
            user_id: userId,
            source: 'csv_import',
        }));

        if (newSubscribers.length === 0) return [];

        const result = await this.knex.batchInsert(TABLES.SUBSCRIBERS, newSubscribers, BATCH_INSERT_SIZE).returning('id');
        // Extract just the IDs as a flat array
        return result.map(row => row.id);
    }

    async validateEmailAddress(email: string): Promise<boolean> {
        try {
            const response = await this.validatorAxios.get(`/validate-email?email=${encodeURIComponent(email)}`);
            return response.data.valid;
        } catch (error) {
            return false;
        }
    }

    async addSingleSubscriber(subscriberData: { email: string; first_name?: string; last_name?: string }, userId: string): Promise<{ id: string; isNew: boolean }> {
        const email = subscriberData.email.trim().toLowerCase();

        // Check if subscriber already exists for this user
        const existingSubscriber = await this.knex(TABLES.SUBSCRIBERS)
            .select('id')
            .where({ user_id: userId, email })
            .first();

        if (existingSubscriber) {
            return { id: existingSubscriber.id, isNew: false };
        }

        // Validate email
        const isValid = await this.validateEmailAddress(email);

        // Add new subscriber
        const [subscriber] = await this.knex(TABLES.SUBSCRIBERS)
            .insert({
                email,
                first_name: subscriberData.first_name || null,
                last_name: subscriberData.last_name || null,
                status: isValid ? 1 : 0,
                user_id: userId,
                row_status: 1,
                source: 'single_import'
            })
            .returning('id');

        return { id: subscriber.id, isNew: true };
    }

    async getAllSubscribersByUserId(userId: string, filters?: { status?: number; missingFields?: string[]; segmentCondition?: string; segment?: string[] }): Promise<any[]> {
        const query = this.knex(TABLES.SUBSCRIBERS)
            .select(
                `${TABLES.SUBSCRIBERS}.id`,
                `${TABLES.SUBSCRIBERS}.first_name`,
                `${TABLES.SUBSCRIBERS}.last_name`,
                `${TABLES.SUBSCRIBERS}.email`,
                `${TABLES.SUBSCRIBERS}.status`,
                `${TABLES.SUBSCRIBERS}.created_at`,
                `${TABLES.SUBSCRIBERS}.updated_at`,
                `${TABLES.SUBSCRIBERS}.metadata`,
                `${TABLES.CONTACT_BLOCKLIST}.reason as blocklist_reason`,
                `${TABLES.CONTACT_BLOCKLIST}.blocked_at as blocklist_date`,
                this.knex.raw(`
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', ${TABLES.SEGMENTS}.id,
                                'name', ${TABLES.SEGMENTS}.name,
                                'color', ${TABLES.SEGMENTS}.color
                            )
                        ) FILTER (WHERE ${TABLES.SEGMENTS}.id IS NOT NULL),
                        '[]'
                    ) as segments
                `)
            )
            .leftJoin(TABLES.SUBSCRIBER_SEGMENT, `${TABLES.SUBSCRIBERS}.id`, `${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
            .leftJoin(TABLES.SEGMENTS, `${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, `${TABLES.SEGMENTS}.id`)
            .leftJoin(TABLES.CONTACT_BLOCKLIST, function () {
                this.on(`${TABLES.CONTACT_BLOCKLIST}.contact_id`, '=', `${TABLES.SUBSCRIBERS}.id`)
                    .andOnVal(`${TABLES.CONTACT_BLOCKLIST}.user_id`, '=', userId);
            })
            .where({
                [`${TABLES.SUBSCRIBERS}.user_id`]: userId,
                [`${TABLES.SUBSCRIBERS}.row_status`]: 1
            });

        // Apply status filter if provided
        if (filters?.status !== undefined) {
            query.andWhere(`${TABLES.SUBSCRIBERS}.status`, filters.status);
        }

        // Apply missingFields filter if provided (return rows where all of the specified columns are NULL or empty)
        if (filters?.missingFields && filters.missingFields.length > 0) {
            filters.missingFields.forEach(field => {
                query.andWhereRaw(`(${TABLES.SUBSCRIBERS}.?? IS NULL OR ${TABLES.SUBSCRIBERS}.?? = '')`, [field, field]);
            });
        }

        // Apply segment filters if provided
        if (filters?.segmentCondition) {
            const segmentIds = filters.segment || [];

            switch (filters.segmentCondition) {
                case 'is_only_in':
                    // Subscribers that are ONLY in the specified segments (not in any other segments)
                    if (segmentIds.length > 0) {
                        query.whereIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                            subquery
                                .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .from(TABLES.SUBSCRIBER_SEGMENT)
                                .groupBy(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .havingRaw(
                                    `COUNT(DISTINCT ${TABLES.SUBSCRIBER_SEGMENT}.segment_id) = ? AND ` +
                                    `COUNT(DISTINCT CASE WHEN ${TABLES.SUBSCRIBER_SEGMENT}.segment_id IN (${segmentIds.map(() => '?').join(',')}) THEN ${TABLES.SUBSCRIBER_SEGMENT}.segment_id END) = ?`,
                                    [segmentIds.length, ...segmentIds, segmentIds.length]
                                );
                        });
                    }
                    break;

                case 'is_in_any':
                    // Subscribers that are in at least one of the specified segments
                    if (segmentIds.length > 0) {
                        query.whereIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                            subquery
                                .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .from(TABLES.SUBSCRIBER_SEGMENT)
                                .whereIn(`${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, segmentIds);
                        });
                    }
                    break;

                case 'is_in_all':
                    // Subscribers that are in all of the specified segments
                    if (segmentIds.length > 0) {
                        query.whereIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                            subquery
                                .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .from(TABLES.SUBSCRIBER_SEGMENT)
                                .whereIn(`${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, segmentIds)
                                .groupBy(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .havingRaw(`COUNT(DISTINCT ${TABLES.SUBSCRIBER_SEGMENT}.segment_id) = ?`, [segmentIds.length]);
                        });
                    }
                    break;

                case 'is_not_in_any':
                    // Subscribers that are not in any of the specified segments
                    if (segmentIds.length > 0) {
                        query.whereNotIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                            subquery
                                .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .from(TABLES.SUBSCRIBER_SEGMENT)
                                .whereIn(`${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, segmentIds);
                        });
                    }
                    break;

                case 'is_not_in_all':
                    // Subscribers that are not in all of the specified segments (could be in some but not all)
                    if (segmentIds.length > 0) {
                        query.whereNotIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                            subquery
                                .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .from(TABLES.SUBSCRIBER_SEGMENT)
                                .whereIn(`${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, segmentIds)
                                .groupBy(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                                .havingRaw(`COUNT(DISTINCT ${TABLES.SUBSCRIBER_SEGMENT}.segment_id) = ?`, [segmentIds.length]);
                        });
                    }
                    break;

                case 'is_not_in_any_segment':
                    // Subscribers that are not in any segment at all
                    query.whereNotIn(`${TABLES.SUBSCRIBERS}.id`, (subquery) => {
                        subquery
                            .select(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
                            .from(TABLES.SUBSCRIBER_SEGMENT)
                            .distinct();
                    });
                    break;
            }
        }

        const subscribers = await query
            .groupBy(
                `${TABLES.SUBSCRIBERS}.id`,
                `${TABLES.SUBSCRIBERS}.first_name`,
                `${TABLES.SUBSCRIBERS}.last_name`,
                `${TABLES.SUBSCRIBERS}.email`,
                `${TABLES.SUBSCRIBERS}.status`,
                `${TABLES.SUBSCRIBERS}.created_at`,
                `${TABLES.SUBSCRIBERS}.updated_at`,
                `${TABLES.CONTACT_BLOCKLIST}.reason`,
                `${TABLES.CONTACT_BLOCKLIST}.blocked_at`,
            )
            .orderBy(`${TABLES.SUBSCRIBERS}.created_at`, 'desc');

        return subscribers.map((s: any) => ({
            ...s,
            is_blocklisted: !!s.blocklist_reason,
        }));
    }

    async getSubscriberById(subscriberId: string, userId: string): Promise<any> {
        const subscriber = await this.knex(TABLES.SUBSCRIBERS)
            .select(
                `${TABLES.SUBSCRIBERS}.id`,
                `${TABLES.SUBSCRIBERS}.first_name`,
                `${TABLES.SUBSCRIBERS}.last_name`,
                `${TABLES.SUBSCRIBERS}.email`,
                `${TABLES.SUBSCRIBERS}.status`,
                `${TABLES.SUBSCRIBERS}.metadata`,
                `${TABLES.SUBSCRIBERS}.notes`,
                `${TABLES.SUBSCRIBERS}.source`,
                `${TABLES.CONTACT_BLOCKLIST}.reason as blocklist_reason`,
                `${TABLES.CONTACT_BLOCKLIST}.blocked_at as blocklist_date`,
                `${TABLES.CONTACT_BLOCKLIST}.notes as blocklist_notes`,
                this.knex.raw(`
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', ${TABLES.SEGMENTS}.id,
                                'name', ${TABLES.SEGMENTS}.name,
                                'color', ${TABLES.SEGMENTS}.color
                            )
                        ) FILTER (WHERE ${TABLES.SEGMENTS}.id IS NOT NULL),
                        '[]'
                    ) as segments
                `),
                `${TABLES.SUBSCRIBERS}.created_at`,
                `${TABLES.SUBSCRIBERS}.updated_at`,
            )
            .leftJoin(TABLES.SUBSCRIBER_SEGMENT, `${TABLES.SUBSCRIBERS}.id`, `${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
            .leftJoin(TABLES.SEGMENTS, `${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, `${TABLES.SEGMENTS}.id`)
            .leftJoin(TABLES.CONTACT_BLOCKLIST, function () {
                this.on(`${TABLES.CONTACT_BLOCKLIST}.contact_id`, '=', `${TABLES.SUBSCRIBERS}.id`)
                    .andOnVal(`${TABLES.CONTACT_BLOCKLIST}.user_id`, '=', userId);
            })
            .where({
                [`${TABLES.SUBSCRIBERS}.id`]: subscriberId,
                [`${TABLES.SUBSCRIBERS}.user_id`]: userId,
                [`${TABLES.SUBSCRIBERS}.row_status`]: 1
            })
            .groupBy(
                `${TABLES.SUBSCRIBERS}.id`,
                `${TABLES.SUBSCRIBERS}.first_name`,
                `${TABLES.SUBSCRIBERS}.last_name`,
                `${TABLES.SUBSCRIBERS}.email`,
                `${TABLES.SUBSCRIBERS}.status`,
                `${TABLES.SUBSCRIBERS}.created_at`,
                `${TABLES.SUBSCRIBERS}.updated_at`,
                `${TABLES.SUBSCRIBERS}.metadata`,
                `${TABLES.CONTACT_BLOCKLIST}.reason`,
                `${TABLES.CONTACT_BLOCKLIST}.blocked_at`,
                `${TABLES.CONTACT_BLOCKLIST}.notes`,
            )
            .first();

        if (!subscriber) return null;

        return {
            ...subscriber,
            is_blocklisted: !!subscriber.blocklist_reason,
        };
    }

    async getSubscriberByEmail(email: string, userId: string): Promise<any> {
        const subscriber = await this.knex(TABLES.SUBSCRIBERS)
            .select('id')
            .where({
                email: email.trim().toLowerCase(),
                user_id: userId,
                row_status: 1
            })
            .first();

        return subscriber;
    }

    async updateSubscriber(subscriberId: string, userId: string, updateData: { first_name?: string; last_name?: string; email?: string; notes?: string; status?: number; attributes?: Record<string, string> }): Promise<boolean> {
        const updates: any = {
            updated_at: this.knex.fn.now()
        };

        const { attributes, ...rest } = updateData;

        for (const key in rest) {
            if (!Object.hasOwn(rest, key)) continue;
            const element = rest[key];
            if (element !== undefined && element !== null) {
                updates[key] = element;
            }
        }

        if (attributes && Object.keys(attributes).length > 0) {
            // Merge into metadata->attributes using jsonb_set / || operator
            updates['metadata'] = this.knex.raw(
                `COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('attributes', COALESCE(metadata->'attributes', '{}'::jsonb) || ?::jsonb)`,
                [JSON.stringify(attributes)]
            );
        }

        const updated = await this.knex(TABLES.SUBSCRIBERS)
            .where({
                id: subscriberId,
                user_id: userId,
                row_status: 1
            })
            .update(updates);

        return updated > 0;
    }

    async getAvailableSegmentsForSubscriber(subscriberId: string, userId: string): Promise<any[]> {
        // Get all segments where the subscriber is NOT added
        const availableSegments = await this.knex(TABLES.SEGMENTS)
            .select(
                `${TABLES.SEGMENTS}.id`,
                `${TABLES.SEGMENTS}.name`,
                `${TABLES.SEGMENTS}.color`,
                `${TABLES.SEGMENTS}.created_at`,
                `${TABLES.SEGMENTS}.updated_at`
            )
            .where({
                [`${TABLES.SEGMENTS}.user_id`]: userId,
                [`${TABLES.SEGMENTS}.row_status`]: 1
            })
            .whereNotExists(
                this.knex(TABLES.SUBSCRIBER_SEGMENT)
                    .select(this.knex.raw('1'))
                    .whereRaw(`${TABLES.SUBSCRIBER_SEGMENT}.segment_id = ${TABLES.SEGMENTS}.id`)
                    .andWhere(`${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`, subscriberId)
            )
            .orderBy(`${TABLES.SEGMENTS}.created_at`, 'desc');

        return availableSegments;
    }

    async deleteSubscriber(subscriberId: string, userId: string): Promise<boolean> {
        const deleted = await this.knex(TABLES.SUBSCRIBERS)
            .where({
                id: subscriberId,
                user_id: userId,
                row_status: 1
            })
            .update({
                row_status: 0,
                updated_at: this.knex.fn.now()
            });

        return deleted > 0;
    }

    async deleteMultipleSubscribers(subscriberIds: string[], userId: string): Promise<number> {
        const deleted = await this.knex(TABLES.SUBSCRIBERS)
            .whereIn('id', subscriberIds)
            .where({
                user_id: userId,
                row_status: 1
            })
            .update({
                row_status: 0,
                updated_at: this.knex.fn.now()
            });

        return deleted;
    }

    /**
     * Return all known custom attribute keys for the user's contacts.
     * Scans metadata->attributes JSONB keys across a sample of records.
     * Returns an array of { key, label, type } objects.
     */
    async getAttributeKeys(userId: string): Promise<{ key: string; label: string; type: string }[]> {
        // Collect all distinct keys from metadata.attributes across the user's contacts
        const rows = await this.knex(TABLES.SUBSCRIBERS)
            .where({ user_id: userId, row_status: 1 })
            .whereNotNull('metadata')
            .select(this.knex.raw(`jsonb_object_keys(metadata->'attributes') as key`))
            .distinct()
            .limit(200);

        const customKeys = rows.map((r: any) => ({
            key: r.key,
            label: r.key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            type: 'string',
        }));

        // Prepend standard fields
        const standardFields = [
            { key: 'first_name', label: 'First Name', type: 'string' },
            { key: 'last_name', label: 'Last Name', type: 'string' },
            { key: 'email', label: 'Email', type: 'string' },
            { key: 'phone', label: 'Phone', type: 'string' },
            { key: 'status', label: 'Status', type: 'number' },
        ];

        return [...standardFields, ...customKeys];
    }
}