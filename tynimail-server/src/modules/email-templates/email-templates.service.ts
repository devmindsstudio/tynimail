import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES } from "@/constants";

@Injectable()
export class EmailTemplatesService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }

    async getEmailTemplatesByUserId(userId: string): Promise<any[]> {
        return this.knex(TABLES.EMAIL_TEMPLATES)
            .select('id', 'name', 'description', 'subject', 'preheader_text', 'variables', 'created_at', 'updated_at')
            .where({ user_id: userId, is_active: true })
            .orderBy('created_at', 'desc');
    }

    async getEmailTemplateById(templateId: string, userId: string): Promise<any> {
        return this.knex(TABLES.EMAIL_TEMPLATES)
            .select('id', 'name', 'description', 'subject', 'preheader_text', 'html_content', 'text_content', 'variables', 'created_at', 'updated_at')
            .where({ id: templateId, user_id: userId, is_active: true })
            .first();
    }

    async createEmailTemplate(data: {
        userId: string;
        name: string;
        description?: string;
        subject: string;
        preheaderText?: string;
        htmlContent?: string;
        textContent?: string;
        variables?: object;
    }): Promise<any> {
        const [template] = await this.knex(TABLES.EMAIL_TEMPLATES)
            .insert({
                user_id: data.userId,
                name: data.name,
                description: data.description ?? null,
                subject: data.subject,
                preheader_text: data.preheaderText ?? null,
                html_content: data.htmlContent ?? null,
                text_content: data.textContent ?? null,
                variables: data.variables ?? null,
                is_active: true,
            })
            .returning('*');
        return template;
    }

    async updateEmailTemplate(templateId: string, userId: string, data: {
        name?: string;
        description?: string;
        subject?: string;
        preheaderText?: string;
        htmlContent?: string;
        textContent?: string;
        variables?: object;
    }): Promise<any> {
        const updateData: Record<string, any> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.subject !== undefined) updateData.subject = data.subject;
        if (data.preheaderText !== undefined) updateData.preheader_text = data.preheaderText;
        if (data.htmlContent !== undefined) updateData.html_content = data.htmlContent;
        if (data.textContent !== undefined) updateData.text_content = data.textContent;
        if (data.variables !== undefined) updateData.variables = data.variables;
        updateData.updated_at = new Date();

        const [template] = await this.knex(TABLES.EMAIL_TEMPLATES)
            .where({ id: templateId, user_id: userId, is_active: true })
            .update(updateData)
            .returning('*');
        return template;
    }

    async deleteEmailTemplate(templateId: string, userId: string): Promise<boolean> {
        const count = await this.knex(TABLES.EMAIL_TEMPLATES)
            .where({ id: templateId, user_id: userId, is_active: true })
            .update({ is_active: false, updated_at: new Date() });
        return count > 0;
    }
}
