import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { TABLES, DEVICE_TYPE } from '@/constants';

@Injectable()
export class PageAnalyticsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async trackPageView(pageId: string, data: any): Promise<void> {
    let visitorId = null;

    if (data.fingerprint) {
      const visitor = await this.getOrCreateVisitor(data.fingerprint);
      visitorId = visitor.id;
    }

    await this.knex(TABLES.PAGE_VIEWS).insert({
      page_id: pageId,
      visitor_id: visitorId,
      device_type: data.deviceType || DEVICE_TYPE.DESKTOP,
      session_duration: data.sessionDuration || null,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
    });
  }

  async getOrCreateVisitor(fingerprint: string): Promise<any> {
    let visitor = await this.knex(TABLES.PAGE_VISITORS)
      .where('fingerprint', fingerprint)
      .first();

    if (!visitor) {
      [visitor] = await this.knex(TABLES.PAGE_VISITORS)
        .insert({
          fingerprint: fingerprint,
          first_visit: this.knex.fn.now(),
          last_visit: this.knex.fn.now(),
        })
        .returning('*');
    } else {
      await this.knex(TABLES.PAGE_VISITORS).where('id', visitor.id).update({
        last_visit: this.knex.fn.now(),
      });
    }

    return visitor;
  }

  async getPageAnalytics(pageId: string, userId: string): Promise<any> {
    const page = await this.knex(TABLES.PAGES)
      .where({
        id: pageId,
        user_id: userId,
      })
      .whereNull('deleted_at')
      .first();

    if (!page) {
      return null;
    }

    const totalViews = await this.knex(TABLES.PAGE_VIEWS)
      .where('page_id', pageId)
      .count('id as count')
      .first();

    const uniqueVisitors = await this.knex(TABLES.PAGE_VIEWS)
      .where('page_id', pageId)
      .whereNotNull('visitor_id')
      .countDistinct('visitor_id as count')
      .first();

    // const avgSessionDuration = await this.knex(TABLES.PAGE_VIEWS)
    //     .where('page_id', pageId)
    //     .whereNotNull('session_duration')
    //     .avg('session_duration as avg')
    //     .first();

    const avgSessionDuration = await this.knex(TABLES.PAGE_SESSIONS)
      .where('page_id', pageId)
      .whereNotNull('session_duration')
      .avg('session_duration as avg')
      .first();

    const viewsByDevice = await this.knex(TABLES.PAGE_VIEWS)
      .where('page_id', pageId)
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
        deviceCounts.desktop = parseInt(item.count);
      } else if (item.device_type === DEVICE_TYPE.TABLET) {
        deviceCounts.tablet = parseInt(item.count);
      } else if (item.device_type === DEVICE_TYPE.MOBILE) {
        deviceCounts.mobile = parseInt(item.count);
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const visitorTrendsRaw = await this.knex(TABLES.PAGE_VIEWS)
      .where('page_id', pageId)
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

    return {
      pageName: page.name,
      totalViews: parseInt(String(totalViews?.count || '0')),
      uniqueVisitors: parseInt(String(uniqueVisitors?.count || '0')),
      sessionDuration: Math.round(
        parseFloat(String(avgSessionDuration?.avg || '0')),
      ),
      viewsByDevice: deviceCounts,
      visitorTrends,
    };
  }
}
