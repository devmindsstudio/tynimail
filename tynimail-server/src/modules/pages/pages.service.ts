import { Injectable, Inject } from "@nestjs/common";
import { randomBytes } from "crypto";
import { Knex } from "knex";
import { TABLES, PAGE_STATUS } from "@/constants";
import { PageTemplatesService } from "./page-templates.service";

@Injectable()
export class PagesService {
    constructor(
        @Inject('KNEX_CONNECTION') private readonly knex: Knex,
        private readonly pageTemplatesService: PageTemplatesService
    ) {}

    async getPagesByUserId(userId: string, search?: string): Promise<any[]> {
        let query = this.knex(TABLES.PAGES)
            .select(
                'id',
                'name',
                'slug',
                'content',
                'status',
                'template_id',
                'updated_at',
                'created_at'
            )
            .where('user_id', userId)
            .whereNull('deleted_at')
            .orderBy('updated_at', 'desc');

        if (search) {
            query = query.where('name', 'ilike', `%${search}%`);
        }

        return query;
    }

    async getPageById(pageId: string, userId: string): Promise<any> {
        const page = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .first();

        return page;
    }

    async getPageBySlug(slug: string): Promise<any> {
        const page = await this.knex(TABLES.PAGES)
            .where({
                slug: slug,
                status: PAGE_STATUS.PUBLISHED
            })
            .whereNull('deleted_at')
            .first();

        return page;
    }

    async getPublicPageById(id: string): Promise<any> {
        return this.knex(TABLES.PAGES)
            .where({ id, status: PAGE_STATUS.PUBLISHED })
            .whereNull('deleted_at')
            .first();
    }

    private uniqueSlugSuffix(): string {
        return randomBytes(4).toString('hex');
    }

    async generateSlug(name: string, userId: string, excludeId?: string, reservedSlugs: string[] = []): Promise<string> {
        const baseSlug = (name || 'page')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'page';

        let slug = `${baseSlug}-${this.uniqueSlugSuffix()}`;

        while (true) {
            if (reservedSlugs.includes(slug)) {
                slug = `${baseSlug}-${this.uniqueSlugSuffix()}`;
                continue;
            }

            const query = this.knex(TABLES.PAGES)
                .where('slug', slug)
                .whereNull('deleted_at');

            if (excludeId) {
                query.whereNot('id', excludeId);
            }

            const existing = await query.first();

            if (!existing) {
                break;
            }

            slug = `${baseSlug}-${this.uniqueSlugSuffix()}`;
        }

        return slug;
    }

    async createPage(data: any): Promise<any> {
        const slug = await this.generateSlug(data.name, data.userId);

        const [page] = await this.knex(TABLES.PAGES)
            .insert({
                user_id: data.userId,
                name: data.name,
                slug: slug,
                content: data.content ?? '',
                status: PAGE_STATUS.PUBLISHED,
                template_id: data.templateId || null,
            })
            .returning('*');

        return page;
    }

    async updatePage(pageId: string, userId: string, data: any): Promise<any> {
        const updateData: any = {
            updated_at: this.knex.fn.now()
        };

        if (data.name) {
            const slug = await this.generateSlug(data.name, userId, pageId);
            updateData.name = data.name;
            updateData.slug = slug;
        }

        if (data.content !== undefined) {
            updateData.content = data.content;
        }

        if (data.status !== undefined) {
            updateData.status = data.status;
        }

        const [page] = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .update(updateData)
            .returning('*');

        return page;
    }

    async deletePage(pageId: string, userId: string): Promise<boolean> {
        const updated = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .update({
                deleted_at: this.knex.fn.now(),
                updated_at: this.knex.fn.now()
            });

        return updated > 0;
    }

    async deletePages(userId: string, pageIds: string[]): Promise<number> {
        if (pageIds.length === 0) return 0;

        const updated = await this.knex(TABLES.PAGES)
            .where('user_id', userId)
            .whereNull('deleted_at')
            .whereIn('id', pageIds)
            .update({
                deleted_at: this.knex.fn.now(),
                updated_at: this.knex.fn.now()
            });

        return updated;
    }

    async publishPage(pageId: string, userId: string): Promise<any> {
        const [page] = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .update({
                status: PAGE_STATUS.PUBLISHED,
                updated_at: this.knex.fn.now()
            })
            .returning('*');

        return page;
    }

    async unpublishPage(pageId: string, userId: string): Promise<any> {
        const [page] = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .update({
                status: PAGE_STATUS.DRAFT,
                updated_at: this.knex.fn.now()
            })
            .returning('*');

        return page;
    }

    async verifyPageOwnership(pageId: string, userId: string): Promise<boolean> {
        const page = await this.knex(TABLES.PAGES)
            .where({
                id: pageId,
                user_id: userId
            })
            .whereNull('deleted_at')
            .first();

        return !!page;
    }

    async copyPages(userId: string, pageIds: string[]): Promise<any[]> {
        const copied: any[] = [];
        const reservedSlugs: string[] = [];
        for (const pageId of pageIds) {
            const page = await this.knex(TABLES.PAGES)
                .where({ id: pageId, user_id: userId })
                .whereNull('deleted_at')
                .first();

            if (!page) continue;

            const slug = await this.generateSlug(page.name, userId, undefined, reservedSlugs);
            reservedSlugs.push(slug);

            const [newPage] = await this.knex(TABLES.PAGES)
                .insert({
                    user_id: userId,
                    name: page.name,
                    slug: slug,
                    content: page.content ?? '',
                    status: PAGE_STATUS.DRAFT,
                    template_id: page.template_id,
                })
                .returning('*');

            copied.push(newPage);
        }
        return copied;
    }

    async updatePageTemplate(pageId: string, userId: string, data: { name?: string; content?: string }): Promise<{ page: any; template: any } | null> {
        const page = await this.knex(TABLES.PAGES)
            .where({ id: pageId, user_id: userId })
            .whereNull('deleted_at')
            .first();

        if (!page) return null;

        if (!page.template_id) {
            const [template] = await this.knex(TABLES.PAGE_TEMPLATES)
                .insert({
                    name: data.name || page.name,
                    category: null,
                    content: data.content !== undefined ? data.content : (page.content ?? ''),
                    preview_image_url: null,
                    is_system: false,
                    user_id: userId,
                })
                .returning('*');

            const [updatedPage] = await this.knex(TABLES.PAGES)
                .where({ id: pageId, user_id: userId })
                .whereNull('deleted_at')
                .update({
                    template_id: template.id,
                    updated_at: this.knex.fn.now()
                })
                .returning('*');

            return { page: updatedPage, template };
        }

        const existingTemplate = await this.pageTemplatesService.getTemplateById(page.template_id, userId);
        if (!existingTemplate) return null;

        const updatedTemplate = await this.pageTemplatesService.updateTemplate(page.template_id, userId, {
            name: data.name,
            content: data.content,
        });

        if (existingTemplate.is_system && updatedTemplate && updatedTemplate.id !== page.template_id) {
            const [updatedPage] = await this.knex(TABLES.PAGES)
                .where({ id: pageId, user_id: userId })
                .whereNull('deleted_at')
                .update({
                    template_id: updatedTemplate.id,
                    updated_at: this.knex.fn.now()
                })
                .returning('*');
            return { page: updatedPage, template: updatedTemplate };
        }

        return { page, template: updatedTemplate };
    }
}
