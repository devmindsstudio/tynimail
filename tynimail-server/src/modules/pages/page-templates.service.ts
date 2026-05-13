import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES } from "@/constants";

@Injectable()
export class PageTemplatesService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

    async getTemplates(userId?: string): Promise<any[]> {
        const query = this.knex(TABLES.PAGE_TEMPLATES)
            .select('id', 'name', 'content', 'is_system', 'user_id', 'created_at', 'updated_at')
            .where(function() {
                this.where('is_system', true)
                    .orWhere(function() {
                        if (userId) {
                            this.where('is_system', false)
                                .andWhere('user_id', userId);
                        }
                    });
            })
            .orderBy('created_at', 'desc');

        return query;
    }

    async getTemplateById(templateId: string, userId?: string): Promise<any> {
        const template = await this.knex(TABLES.PAGE_TEMPLATES)
            .select('id', 'name', 'content', 'is_system', 'user_id', 'created_at', 'updated_at')
            .where('id', templateId)
            .where(function() {
                this.where('is_system', true)
                    .orWhere(function() {
                        if (userId) {
                            this.where('is_system', false)
                                .andWhere('user_id', userId);
                        }
                    });
            })
            .first();

        return template;
    }

    async createTemplate(data: any): Promise<any> {
        const [template] = await this.knex(TABLES.PAGE_TEMPLATES)
            .insert({
                name: data.name,
                category: data.category || null,
                content: data.content ?? '',
                preview_image_url: data.previewImageUrl || null,
                is_system: false,
                user_id: data.userId,
            })
            .returning('*');

        return template;
    }

    async updateTemplate(templateId: string, userId: string, data: any): Promise<any> {
        const existing = await this.knex(TABLES.PAGE_TEMPLATES)
            .where('id', templateId)
            .first();

        if (!existing) {
            return null;
        }

        if (existing.is_system) {
            const [newTemplate] = await this.knex(TABLES.PAGE_TEMPLATES)
                .insert({
                    name: data.name ?? existing.name,
                    category: data.category !== undefined ? data.category : existing.category,
                    content: data.content !== undefined ? data.content : (existing.content ?? ''),
                    preview_image_url: data.previewImageUrl !== undefined ? data.previewImageUrl : existing.preview_image_url,
                    is_system: false,
                    user_id: userId,
                })
                .returning('*');
            return newTemplate;
        }

        if (existing.user_id !== userId) {
            return null;
        }

        const updatePayload: any = { updated_at: this.knex.fn.now() };
        if (data.name !== undefined) updatePayload.name = data.name;
        if (data.category !== undefined) updatePayload.category = data.category;
        if (data.content !== undefined) updatePayload.content = data.content;
        if (data.previewImageUrl !== undefined) updatePayload.preview_image_url = data.previewImageUrl;

        const [template] = await this.knex(TABLES.PAGE_TEMPLATES)
            .where({ id: templateId, user_id: userId, is_system: false })
            .update(updatePayload)
            .returning('*');

        return template;
    }

    async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
        const deleted = await this.knex(TABLES.PAGE_TEMPLATES)
            .where({
                id: templateId,
                user_id: userId,
                is_system: false
            })
            .delete();

        return deleted > 0;
    }

    async verifyTemplateAccess(templateId: string, userId?: string): Promise<boolean> {
        const template = await this.knex(TABLES.PAGE_TEMPLATES)
            .where('id', templateId)
            .where(function() {
                this.where('is_system', true)
                    .orWhere(function() {
                        if (userId) {
                            this.where('is_system', false)
                                .andWhere('user_id', userId);
                        }
                    });
            })
            .first();

        return !!template;
    }

    async verifyTemplateOwnership(templateId: string, userId: string): Promise<boolean> {
        const template = await this.knex(TABLES.PAGE_TEMPLATES)
            .where({
                id: templateId,
                user_id: userId,
                is_system: false
            })
            .first();

        return !!template;
    }

}
