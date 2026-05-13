import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES } from "@/constants";

@Injectable()
export class UserTemplateService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

    async getUserTemplatesByUserId(userId: string): Promise<any[]> {
        const userTemplates = await this.knex(TABLES.USER_TEMPLATES)
            .select(
                'id',
                'user_id',
                'template_id',
                'content',
                'status',
                'created_at',
                'updated_at',
                'deleted_at'
            )
            .where({ user_id: userId })
            .whereNull('deleted_at')
            .where('status', 1)
            .orderBy('created_at', 'desc');

        return userTemplates;
    }

    async getUserTemplateById(userTemplateId: string, userId: string): Promise<any> {
        const userTemplate = await this.knex(TABLES.USER_TEMPLATES)
            .select(
                'id',
                'user_id',
                'template_id',
                'content',
                'status',
                'created_at',
                'updated_at',
                'deleted_at'
            )
            .where({
                id: userTemplateId,
                user_id: userId,
            })
            .whereNull('deleted_at')
            .first();

        return userTemplate;
    }

    async createUserTemplate(data: { userId: string; templateId?: string; content: string; status?: number; }): Promise<any> {
        const [userTemplate] = await this.knex(TABLES.USER_TEMPLATES)
            .insert({
                user_id: data.userId,
                template_id: data.templateId ?? null,
                content: data.content,
                status: data.status ?? 1,
            })
            .returning('*');

        return userTemplate;
    }

    async updateUserTemplate(
        userTemplateId: string,
        userId: string,
        data: { templateId?: string | null; content?: string; status?: number; }
    ): Promise<any> {
        const updatePayload: Record<string, any> = {
            updated_at: this.knex.fn.now(),
        };

        if (data.templateId !== undefined) updatePayload.template_id = data.templateId;
        if (data.content !== undefined) updatePayload.content = data.content;
        if (data.status !== undefined) updatePayload.status = data.status;

        const [userTemplate] = await this.knex(TABLES.USER_TEMPLATES)
            .where({
                id: userTemplateId,
                user_id: userId,
            })
            .whereNull('deleted_at')
            .update(updatePayload)
            .returning('*');

        return userTemplate;
    }

    async deleteUserTemplate(userTemplateId: string, userId: string): Promise<boolean> {
        const updated = await this.knex(TABLES.USER_TEMPLATES)
            .where({
                id: userTemplateId,
                user_id: userId,
            })
            .whereNull('deleted_at')
            .update({
                status: 0,
                deleted_at: this.knex.fn.now(),
                updated_at: this.knex.fn.now(),
            });

        return updated > 0;
    }
}


