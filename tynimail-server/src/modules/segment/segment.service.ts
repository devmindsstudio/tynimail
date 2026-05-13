import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES, BATCH_INSERT_SIZE } from "@/constants";

@Injectable()
export class SegmentService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }

    async createSegment(data: { userId: string; name: string; color?: string }): Promise<any> {
        const [segment] = await this.knex(TABLES.SEGMENTS)
            .insert({
                user_id: data.userId,
                name: data.name,
                color: data.color || null,
                row_status: 1,
                metadata: {
                    open: 0,
                    click: 0,
                },
            })
            .returning('*');

        return segment;
    }

    async getSegmentById(segmentId: string, userId: string): Promise<any> {
        const segment = await this.knex(TABLES.SEGMENTS)
            .select(
                'id',
                'name',
                'color',
                'metadata',
                'created_at',
                'updated_at'
            )
            .where({ id: segmentId, user_id: userId, row_status: 1 })
            .first();

        return segment;
    }

    async getSegmentByName(name: string, userId: string): Promise<any> {
        const segment = await this.knex(TABLES.SEGMENTS)
            .where({ name, user_id: userId, row_status: 1 })
            .first();

        return segment;
    }

    async updateSegment(segmentId: string, userId: string, data: { name?: string; color?: string }): Promise<any> {
        const updateData: any = { updated_at: this.knex.fn.now() };

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.color !== undefined) {
            updateData.color = data.color;
        }

        const [updatedSegment] = await this.knex(TABLES.SEGMENTS)
            .where({ id: segmentId, user_id: userId, row_status: 1 })
            .update(updateData)
            .returning('*');

        return updatedSegment;
    }

    async getSegmentsByUserId(userId: string): Promise<any[]> {
        const segments = await this.knex('tbl_segments as s')
            .leftJoin('tbl_subscriber_segment as ss', 's.id', 'ss.segment_id')
            .select(
                's.id',
                's.name',
                's.color',
                this.knex.raw('COUNT(ss.id) AS subscriber_count'),
                's.metadata',
                's.created_at',
                's.updated_at',
            )
            .where('s.user_id', userId)
            .andWhere('s.row_status', 1)
            .groupBy('s.id', 's.name', 's.color');

        return segments;
    }

    async checkAndAddSubscriberToSegment(segmentId: string, subscriberId: string): Promise<{ added: boolean; alreadyInSegment: boolean, message?: string }> {
        // Check if subscriber is already in this segment
        const existingMapping = await this.knex(TABLES.SUBSCRIBER_SEGMENT)
            .where({
                segment_id: segmentId,
                subscriber_id: subscriberId
            })
            .first();

        if (existingMapping) {
            return { added: false, alreadyInSegment: true, message: 'Subscriber already in this segment' };
        }

        // Add subscriber to segment
        await this.addSubscribersToSegment(segmentId, [subscriberId]);
        return { added: true, alreadyInSegment: false };
    }

    async addSubscribersToSegment(segmentId: string, subscriberIds: string[]): Promise<void> {
        const subscriberSegments = subscriberIds.map(subscriberId => ({
            segment_id: segmentId,
            subscriber_id: subscriberId,
        }));

        await this.knex.batchInsert(TABLES.SUBSCRIBER_SEGMENT, subscriberSegments, BATCH_INSERT_SIZE);
    }

    async getSubscribersBySegmentId(segmentId: string, userId: string, filters?: { status?: number; dataField?: string }): Promise<any[]> {
        const query = this.knex(TABLES.SUBSCRIBERS)
            .select(
                `${TABLES.SUBSCRIBERS}.id`,
                `${TABLES.SUBSCRIBERS}.first_name`,
                `${TABLES.SUBSCRIBERS}.last_name`,
                `${TABLES.SUBSCRIBERS}.email`,
                `${TABLES.SUBSCRIBERS}.status`,
                `${TABLES.SUBSCRIBERS}.metadata`,
                `${TABLES.SUBSCRIBERS}.created_at`,
                `${TABLES.SUBSCRIBERS}.updated_at`,
                `${TABLES.SUBSCRIBER_SEGMENT}.created_at as added_to_segment_at`
            )
            .innerJoin(TABLES.SUBSCRIBER_SEGMENT, `${TABLES.SUBSCRIBERS}.id`, `${TABLES.SUBSCRIBER_SEGMENT}.subscriber_id`)
            .innerJoin(TABLES.SEGMENTS, `${TABLES.SUBSCRIBER_SEGMENT}.segment_id`, `${TABLES.SEGMENTS}.id`)
            .where({
                [`${TABLES.SUBSCRIBER_SEGMENT}.segment_id`]: segmentId,
                [`${TABLES.SEGMENTS}.user_id`]: userId,
                [`${TABLES.SUBSCRIBERS}.user_id`]: userId,
                [`${TABLES.SUBSCRIBERS}.row_status`]: 1
            });

        // Apply status filter if provided
        if (filters?.status !== undefined) {
            query.andWhere(`${TABLES.SUBSCRIBERS}.status`, filters.status);
        }

        // Apply dataField filter if provided (return rows where all of the specified columns are NULL or empty)
        if (filters?.dataField) {
            const fields = filters.dataField.split(',').map(field => field.trim()).filter(field => field);
            if (fields.length > 0) {
                fields.forEach(field => {
                    query.andWhereRaw(`(${TABLES.SUBSCRIBERS}.?? IS NULL OR ${TABLES.SUBSCRIBERS}.?? = '')`, [field, field]);
                });
            }
        }

        const subscribers = await query.orderBy(`${TABLES.SUBSCRIBER_SEGMENT}.created_at`, 'desc');

        return subscribers;
    }

    async removeSubscriberFromSegment(segmentId: string, subscriberId: string): Promise<boolean> {
        const deleted = await this.knex(TABLES.SUBSCRIBER_SEGMENT)
            .where({
                segment_id: segmentId,
                subscriber_id: subscriberId
            })
            .delete();

        return deleted > 0;
    }

    async addMultipleSubscribersToSegment(segmentId: string, subscriberIds: string[]): Promise<{ added: number; alreadyInSegment: number }> {
        // Check which subscribers are already in the segment
        const existingMappings = await this.knex(TABLES.SUBSCRIBER_SEGMENT)
            .select('subscriber_id')
            .where('segment_id', segmentId)
            .whereIn('subscriber_id', subscriberIds)
            .pluck('subscriber_id');

        // Filter out subscribers that are already in the segment
        const newSubscriberIds = subscriberIds.filter(id => !existingMappings.includes(id));

        if (newSubscriberIds.length > 0)
            await this.addSubscribersToSegment(segmentId, newSubscriberIds);

        return {
            added: newSubscriberIds.length,
            alreadyInSegment: existingMappings.length
        };
    }

    async removeMultipleSubscribersFromSegment(segmentId: string, subscriberIds: string[]): Promise<number> {
        const deleted = await this.knex(TABLES.SUBSCRIBER_SEGMENT)
            .where('segment_id', segmentId)
            .whereIn('subscriber_id', subscriberIds)
            .delete();

        return deleted;
    }

    async deleteMultipleSegments(segmentIds: string[], userId: string): Promise<number> {
        const deleted = await this.knex(TABLES.SEGMENTS)
            .whereIn('id', segmentIds)
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
}