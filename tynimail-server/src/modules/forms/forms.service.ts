import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Knex } from 'knex';
import { TABLES, FORM_STATUS } from '@/constants';

@Injectable()
export class FormsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async getFormsByUserId(userId: string, search?: string): Promise<any[]> {
    let query = this.knex(TABLES.FORMS)
      .select(
        'tbl_forms.id',
        'tbl_forms.name',
        'tbl_forms.slug',
        'tbl_forms.status',
        'tbl_forms.updated_at',
        'tbl_forms.created_at',
        this.knex.raw(
          'COUNT(DISTINCT tbl_form_responses.id) as total_responses',
        ),
      )
      .leftJoin(
        TABLES.FORM_RESPONSES,
        'tbl_forms.id',
        'tbl_form_responses.form_id',
      )
      .where('tbl_forms.user_id', userId)
      .whereNull('tbl_forms.deleted_at')
      .groupBy(
        'tbl_forms.id',
        'tbl_forms.name',
        'tbl_forms.slug',
        'tbl_forms.status',
        'tbl_forms.updated_at',
        'tbl_forms.created_at',
      )
      .orderBy('tbl_forms.updated_at', 'desc');

    if (search) {
      query = query.where('tbl_forms.name', 'ilike', `%${search}%`);
    }

    const forms = await query;
    return forms.map((form: any) => ({
      id: form.id,
      name: form.name,
      slug: form.slug,
      status: form.status,
      totalResponses: parseInt(String(form.total_responses || '0')),
      updated_at: form.updated_at,
      created_at: form.created_at,
    }));
  }

  async getFormById(formId: string, userId: string): Promise<any> {
    const form = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .first();

    return form;
  }

  async getFormBySlug(slug: string): Promise<any> {
    const form = await this.knex(TABLES.FORMS)
      .where({
        slug: slug,
        status: FORM_STATUS.LIVE,
      })
      .whereNull('deleted_at')
      .first();

    return form;
  }

  async getPublicFormById(id: string): Promise<any> {
    return this.knex(TABLES.FORMS)
      .where({ id, status: FORM_STATUS.LIVE })
      .whereNull('deleted_at')
      .first();
  }

  private uniqueSlugSuffix(): string {
    return randomBytes(4).toString('hex');
  }

  async generateSlug(
    name: string,
    userId: string,
    excludeId?: string,
    reservedSlugs: string[] = [],
  ): Promise<string> {
    const baseSlug =
      (name || 'form')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'form';

    let slug = `${baseSlug}-${this.uniqueSlugSuffix()}`;

    while (true) {
      if (reservedSlugs.includes(slug)) {
        slug = `${baseSlug}-${this.uniqueSlugSuffix()}`;
        continue;
      }

      const query = this.knex(TABLES.FORMS)
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

  async createForm(data: any): Promise<any> {
    const slug = await this.generateSlug(data.name, data.userId);

    const [form] = await this.knex(TABLES.FORMS)
      .insert({
        user_id: data.userId,
        name: data.name,
        slug: slug,
        content: data.content ?? '',
        status: FORM_STATUS.LIVE,
      })
      .returning('*');

    return form;
  }

  async updateForm(formId: string, userId: string, data: any): Promise<any> {
    const updateData: any = {
      updated_at: this.knex.fn.now(),
    };

    if (data.name) {
      const slug = await this.generateSlug(data.name, userId, formId);
      updateData.name = data.name;
      updateData.slug = slug;
    }

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const [form] = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .update(updateData)
      .returning('*');

    return form;
  }

  async deleteForm(formId: string, userId: string): Promise<boolean> {
    const updated = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });

    return updated > 0;
  }

  async deleteForms(userId: string, formIds: string[]): Promise<number> {
    if (formIds.length === 0) return 0;

    const updated = await this.knex(TABLES.FORMS)
      .where('user_id', userId)
      .whereNull('deleted_at')
      .whereIn('id', formIds)
      .update({
        deleted_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });

    return updated;
  }

  async copyForms(userId: string, formIds: string[]): Promise<any[]> {
    const copied: any[] = [];
    const reservedSlugs: string[] = [];
    for (const formId of formIds) {
      const form = await this.knex(TABLES.FORMS)
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!form) continue;

      const slug = await this.generateSlug(
        form.name,
        userId,
        undefined,
        reservedSlugs,
      );
      reservedSlugs.push(slug);

      const [newForm] = await this.knex(TABLES.FORMS)
        .insert({
          user_id: userId,
          name: form.name,
          slug: slug,
          content: form.content ?? '',
          status: FORM_STATUS.LIVE,
        })
        .returning('*');

      copied.push(newForm);
    }
    return copied;
  }

  async publishForm(formId: string, userId: string): Promise<any> {
    const [form] = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .update({
        status: FORM_STATUS.LIVE,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return form;
  }

  async unpublishForm(formId: string, userId: string): Promise<any> {
    const [form] = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .update({
        status: FORM_STATUS.DRAFT,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return form;
  }

  async verifyFormOwnership(formId: string, userId: string): Promise<boolean> {
    const form = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .first();

    return !!form;
  }
}
