import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES } from "@/constants";

@Injectable()
export class DomainService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }

    async findDomainByName(domainName: string, userId: string): Promise<any> {
        return this.knex(TABLES.DOMAINS)
            .where({ domain_name: domainName, user_id: userId, row_status: 1 })
            .first();
    }

    async getDomainById(id: string, userId: string): Promise<any> {
        return this.knex(TABLES.DOMAINS)
            .where({ id, user_id: userId, row_status: 1 })
            .first();
    }

    async createDomain(userId: string, data: {
        domain_name: string;
        postmark_domain_id: number;
        dkim_host: string;
        dkim_value: string;
        return_path_cname_name: string;
        return_path_cname_value: string;
        is_verified: boolean;
    }): Promise<any> {
        const [domain] = await this.knex(TABLES.DOMAINS)
            .insert({
                user_id: userId,
                ...data,
                row_status: 1
            })
            .returning('*');

        return domain;
    }

    async getDomainsByUserId(userId: string): Promise<any[]> {
        const domains = await this.knex(TABLES.DOMAINS)
            .select(
                'id',
                'domain_name',
                'postmark_domain_id',
                'dkim_host',
                'dkim_value',
                'return_path_cname_name',
                'return_path_cname_value',
                'is_verified',
                'created_at',
                'updated_at',
                'verified_at'
            )
            .where({ user_id: userId, row_status: 1 })
            .orderBy('created_at', 'desc');

        return domains;
    }

    async updateDomain(id: string, data: Partial<{
        postmark_domain_id: number;
        dkim_host: string | null;
        dkim_value: string | null;
        return_path_cname_name: string | null;
        return_path_cname_value: string | null;
        is_verified: boolean;
        verified_at: Date | null;
        row_status: number;
    }>): Promise<any> {
        const [domain] = await this.knex(TABLES.DOMAINS)
            .where({ id })
            .update({
                ...data,
                updated_at: this.knex.fn.now()
            })
            .returning('*');

        return domain;
    }
}