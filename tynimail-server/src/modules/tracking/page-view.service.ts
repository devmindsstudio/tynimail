import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';

@Injectable()
export class PageViewService {
  private readonly logger = new Logger(PageViewService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private eventEmitter: EventEmitter2,
  ) {}

  async getUserBySiteId(siteId: string): Promise<any> {
    return this.knex('tbl_users')
      .where({ site_id: siteId })
      .select('id', 'tracking_enabled', 'element_tracking_enabled')
      .first();
  }

  async savePageSession(pageId: string, sessionDuration: number): Promise<any> {
    const data = await this.knex('tbl_page_sessions').insert({
      page_id: pageId,
      session_duration: sessionDuration,
    });
    return data;
  }

  async trackPageView(data: {
    siteId: string;
    visitorId: string;
    contactId?: string;
    email?: string;
    url: string;
    path: string;
    title?: string;
    referrer?: string;
  }): Promise<void> {
    // Resolve user from siteId — silently ignore unknown/disabled sites
    const user = await this.knex('tbl_users')
      .where({ site_id: data.siteId, tracking_enabled: true })
      .select('id')
      .first();

    if (!user) return;

    // Resolve contact — prefer contactId, fall back to email lookup
    let resolvedContactId: string | null = null;
    if (data.contactId) {
      const contact = await this.knex('tbl_subscribers')
        .where({ id: data.contactId, user_id: user.id })
        .select('id')
        .first();
      if (contact) resolvedContactId = contact.id;
    }
    if (!resolvedContactId && data.email) {
      const contact = await this.knex('tbl_subscribers')
        .where({
          user_id: user.id,
          email: data.email.toLowerCase().trim(),
        })
        .select('id')
        .first();
      if (contact) resolvedContactId = contact.id;
    }

    // Save page view record — column names match 20260212000016 migration schema
    await this.knex('tbl_page_views').insert({
      user_id: user.id,
      tracking_id: data.visitorId, // anonymous visitor ID from JS snippet localStorage
      contact_id: resolvedContactId,
      url: data.url,
      path: data.path,
      title: data.title || null,
      referrer: data.referrer || null,
      viewed_at: this.knex.fn.now(),
    });

    // Only emit trigger event when contact is identified
    if (resolvedContactId) {
      this.eventEmitter.emit('webpage.visited', {
        userId: user.id,
        contactId: resolvedContactId,
        siteId: data.siteId,
        visitorId: data.visitorId,
        url: data.url,
        path: data.path,
        title: data.title || null,
        referrer: data.referrer || null,
        timestamp: new Date(),
      });

      this.logger.debug(
        `[PAGE-VIEW] webpage.visited emitted: contact=${resolvedContactId} url=${data.url}`,
      );
    }
  }
}
