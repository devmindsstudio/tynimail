import { Inject, Injectable } from "@nestjs/common";
import { MetadataInputInterface } from "@/interfaces";
import { Knex } from "knex";
import { META_STATUS, META_TYPES, TABLES } from "@/constants";

@Injectable()
export class MetadataService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}
    async saveMetadata(data: MetadataInputInterface): Promise<any> {
        return await this.knex(TABLES.METADATA).insert({
            meta_type: data.meta_type,
            meta_data: data.meta_data,
            user_id: data.user_id,
        }).returning(['id', 'meta_type', 'meta_data', 'user_id']);
    }

    async getLatestMetadata(userId: string, metaType: number): Promise<any> {
        return await this.knex(TABLES.METADATA)
            .where({ user_id: userId, meta_type: metaType, status: META_STATUS.ACTIVE})
            .orderBy('created_at', 'desc')
            .first();
    }

    async updateMetadataStatus(id: number, status: number): Promise<number> {
        const result = await this.knex(TABLES.METADATA)
            .where({ id })
            .update({ status });
        return result;
    }
}