import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES, TEMPLATE_TYPE } from "@/constants";

@Injectable()
export class TemplateService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

    async getTemplatesByUserId(userId: string): Promise<any[]> {
        const templates = await this.knex(TABLES.TEMPLATES)
            .select(
                'id',
                'type',
                'content',
                'status',
                'user_id',
                'created_at',
                'updated_at'
            )
            .where(function() {
                this.where('type', TEMPLATE_TYPE.SYSTEM)
                    .orWhere(function() {
                        this.where('type', TEMPLATE_TYPE.USER)
                            .andWhere('user_id', userId);
                    });
            })
            .where('status', 1)
            .orderBy('created_at', 'desc');
        
        return templates;
    }

    async getTemplateById(templateId: string, userId: string): Promise<any> {
        const template = await this.knex(TABLES.TEMPLATES)
            .where({
                id: templateId,
                status: 1
            })
            .where(function() {
                this.where('type', TEMPLATE_TYPE.SYSTEM)
                    .orWhere(function() {
                        this.where('type', TEMPLATE_TYPE.USER)
                            .andWhere('user_id', userId);
                    });
            })
            .first();

        return template;
    }

    async createTemplate(data: any): Promise<any> {
        const [template] = await this.knex(TABLES.TEMPLATES)
            .insert({
                user_id: data.userId,
                type: TEMPLATE_TYPE.USER,
                content: data.content,
                status: 1,
            })
            .returning('*');

        return template;
    }

    async updateTemplate(templateId: string, userId: string, data: any): Promise<any> {
        const [template] = await this.knex(TABLES.TEMPLATES)
            .where({
                id: templateId,
                user_id: userId,
                type: TEMPLATE_TYPE.USER
            })
            .update({
                content: data.content,
                updated_at: this.knex.fn.now()
            })
            .returning('*');

        return template;
    }

    async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
        const updated = await this.knex(TABLES.TEMPLATES)
            .where({
                id: templateId,
                user_id: userId,
                type: TEMPLATE_TYPE.USER
            })
            .update({
                status: 0,
                updated_at: this.knex.fn.now()
            });

        return updated > 0;
    }

    async verifyTemplateOwnership(templateId: string, userId: string): Promise<boolean> {
        const template = await this.knex(TABLES.TEMPLATES)
            .where({ id: templateId, status: 1 })
            .where(function() {
                this.where('type', TEMPLATE_TYPE.USER)
                    .andWhere('user_id', userId);
            })
            .first();

        return !!template;
    }

    async isSystemTemplate(templateId: string): Promise<boolean> {
        const template = await this.knex(TABLES.TEMPLATES)
            .where({ 
                id: templateId, 
                type: TEMPLATE_TYPE.SYSTEM,
                status: 1 
            })
            .first();

        return !!template;
    }
}

