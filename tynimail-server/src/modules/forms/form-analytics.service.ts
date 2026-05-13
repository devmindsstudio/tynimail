import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { TABLES, DEVICE_TYPE } from '@/constants';

@Injectable()
export class FormAnalyticsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async trackFormView(formId: string, data: any): Promise<void> {
    let visitorId = null;

    if (data.fingerprint) {
      const visitor = await this.getOrCreateVisitor(data.fingerprint);
      visitorId = visitor.id;
    }

    await this.knex(TABLES.FORM_VIEWS).insert({
      form_id: formId,
      visitor_id: visitorId,
      device_type: data.deviceType || DEVICE_TYPE.DESKTOP,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
    });
  }

  async getOrCreateVisitor(fingerprint: string): Promise<any> {
    let visitor = await this.knex(TABLES.FORM_VISITORS)
      .where('fingerprint', fingerprint)
      .first();

    if (!visitor) {
      [visitor] = await this.knex(TABLES.FORM_VISITORS)
        .insert({
          fingerprint: fingerprint,
          first_visit: this.knex.fn.now(),
          last_visit: this.knex.fn.now(),
        })
        .returning('*');
    } else {
      await this.knex(TABLES.FORM_VISITORS).where('id', visitor.id).update({
        last_visit: this.knex.fn.now(),
      });
    }

    return visitor;
  }

  async submitFormResponse(
    formId: string,
    data: { content: string; fingerprint?: string },
  ): Promise<any> {
    let visitorId = null;

    if (data.fingerprint) {
      const visitor = await this.getOrCreateVisitor(data.fingerprint);
      visitorId = visitor.id;
    }

    let payload: any = data.content;
    try {
      payload =
        typeof data.content === 'string'
          ? JSON.parse(data.content)
          : data.content;
    } catch {
      payload = { raw: data.content };
    }

    const [response] = await this.knex(TABLES.FORM_RESPONSES)
      .insert({
        form_id: formId,
        visitor_id: visitorId,
        response_data: payload,
      })
      .returning('*');

    return response;
  }

  async getFormAnalytics(formId: string, userId: string): Promise<any> {
    const form = await this.knex(TABLES.FORMS)
      .where({
        id: formId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .first();

    if (!form) {
      return null;
    }

    const totalViews = await this.knex(TABLES.FORM_VIEWS)
      .where('form_id', formId)
      .count('id as count')
      .first();

    const uniqueViews = await this.knex(TABLES.FORM_VIEWS)
      .where('form_id', formId)
      .whereNotNull('visitor_id')
      .countDistinct('visitor_id as count')
      .first();

    const totalResponses = await this.knex(TABLES.FORM_RESPONSES)
      .where('form_id', formId)
      .count('id as count')
      .first();

    const viewsByDevice = await this.knex(TABLES.FORM_VIEWS)
      .where('form_id', formId)
      .select('device_type')
      .count('id as count')
      .groupBy('device_type');

    const deviceCounts = {
      desktop: 0,
      tablet: 0,
      mobile: 0,
    };

    viewsByDevice.forEach((item: any) => {
      if (item.device_type === DEVICE_TYPE.DESKTOP) {
        deviceCounts.desktop = parseInt(String(item.count));
      } else if (item.device_type === DEVICE_TYPE.TABLET) {
        deviceCounts.tablet = parseInt(String(item.count));
      } else if (item.device_type === DEVICE_TYPE.MOBILE) {
        deviceCounts.mobile = parseInt(String(item.count));
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const visitorTrendsRaw = await this.knex(TABLES.FORM_VIEWS)
      .where('form_id', formId)
      .select(this.knex.raw('DATE(created_at) as date'))
      .count('id as views')
      .groupBy(this.knex.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    const viewsByDate: Record<string, number> = {};
    visitorTrendsRaw.forEach((item: any) => {
      const d = new Date(item.date);
      const key = d.toISOString().slice(0, 10);
      viewsByDate[key] = parseInt(String(item.views));
    });

    const visitorTrends: { name: string; uv: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const name = dayNames[d.getDay()];
      visitorTrends.push({
        name,
        uv: viewsByDate[key] ?? 0,
      });
    }

    const uniqueViewsCount = parseInt(String(uniqueViews?.count || '0'));
    const totalResponsesCount = parseInt(String(totalResponses?.count || '0'));
    const conversionRate =
      uniqueViewsCount > 0
        ? Math.round((totalResponsesCount / uniqueViewsCount) * 100)
        : 0;

    const rawResponses = await this.knex(TABLES.FORM_RESPONSES)
      .where('form_id', formId)
      .select('id', 'form_id', 'visitor_id', 'response_data', 'created_at')
      .orderBy('created_at', 'desc');

    // Build question label map from form fields/content
    let questionLabelMap: Record<string, string> = {};
    try {
      const fields = form.fields ?? form.content;
      const parsed = typeof fields === 'string' ? JSON.parse(fields) : fields;
      const fieldList: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.fields)
          ? parsed.fields
          : [];
      for (const f of fieldList) {
        const key = f.id ?? f.name ?? f.key;
        const label = f.label ?? f.title ?? f.name ?? key;
        if (key) questionLabelMap[key] = label;
      }
    } catch {
      // form has no parseable field definitions; use raw keys
    }

    // Group responses by question key
    const questionMap: Record<
      string,
      {
        question: string;
        responses: { id: string; value: any; created_at: string }[];
      }
    > = {};

    for (const row of rawResponses) {
      const data: Record<string, any> =
        typeof row.response_data === 'string'
          ? JSON.parse(row.response_data)
          : (row.response_data ?? {});

      for (const [key, value] of Object.entries(data)) {
        if (!questionMap[key]) {
          questionMap[key] = {
            question: questionLabelMap[key] ?? key,
            responses: [],
          };
        }
        questionMap[key].responses.push({
          id: row.id,
          value,
          created_at: row.created_at,
        });
      }
    }

    const responses = Object.values(questionMap);

    return {
      formName: form.name,
      totalViews: parseInt(String(totalViews?.count || '0')),
      uniqueViews: uniqueViewsCount,
      totalResponses: totalResponsesCount,
      conversionRate: conversionRate,
      viewsByDevice: deviceCounts,
      visitorTrends,
      responses,
    };
  }
}
