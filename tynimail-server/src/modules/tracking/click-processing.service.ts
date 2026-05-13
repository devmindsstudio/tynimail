import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { Condition, DynamicProperty } from '../element-rules/element-rules.service';

export interface ClickPayload {
  siteId: string;
  visitorId: string;
  email?: string;
  tag?: string;
  id?: string;
  classes?: string[];
  text?: string;
  href?: string;
  attrs?: Record<string, string>;
  path: string;
  url: string;
}

@Injectable()
export class ClickProcessingService {
  private readonly logger = new Logger(ClickProcessingService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private eventEmitter: EventEmitter2,
  ) {}

  async processClick(data: ClickPayload): Promise<void> {
    try {
      // 1. Resolve user from siteId — check element_tracking_enabled
      const user = await this.knex('tbl_users')
        .where({ site_id: data.siteId })
        .select('id', 'element_tracking_enabled')
        .first();

      if (!user || !user.element_tracking_enabled) return;

      const userId: string = user.id;

      // 2. Resolve contact from email
      let contactId: string | null = null;
      if (data.email) {
        const contact = await this.knex('tbl_subscribers')
          .where({ user_id: userId, email: data.email.toLowerCase().trim() })
          .select('id')
          .first();
        if (contact) contactId = contact.id;
      }

      if (!contactId) {
        this.logger.debug(
          `[CLICK] No contact resolved for email=${data.email} siteId=${data.siteId}`,
        );
        return;
      }

      // 3. Load enabled element rules for this user
      const rules = await this.knex('tbl_element_rules')
        .where({ user_id: userId, enabled: true });

      if (!rules.length) return;

      // 4. Evaluate each rule
      for (const rule of rules) {
        const conditions: Condition[] = typeof rule.conditions === 'string'
          ? JSON.parse(rule.conditions)
          : rule.conditions ?? [];

        const properties: { static: Record<string, any>; dynamic: DynamicProperty[] } =
          typeof rule.properties === 'string'
            ? JSON.parse(rule.properties)
            : rule.properties ?? { static: {}, dynamic: [] };

        if (!this.evaluateRule(conditions, data)) continue;

        // 5. Build merged properties
        const eventProperties = this.buildProperties(properties, data);

        // 6. Record in tbl_custom_events
        await this.knex('tbl_custom_events').insert({
          user_id: userId,
          contact_id: contactId,
          event_name: rule.event_name,
          properties: JSON.stringify(eventProperties),
          event_at: this.knex.fn.now(),
          created_at: this.knex.fn.now(),
        });

        // 7. Emit into the existing custom_event pipeline
        this.eventEmitter.emit(`custom_event.${rule.event_name}`, {
          userId,
          contactId,
          eventName: rule.event_name,
          properties: eventProperties,
          _element: {
            tag: data.tag,
            id: data.id,
            classes: data.classes,
            text: data.text,
            href: data.href,
            path: data.path,
            url: data.url,
            attrs: data.attrs,
          },
          _rule: {
            id: rule.id,
            name: rule.name,
          },
        });

        this.logger.debug(
          `[CLICK] Rule matched — emitted custom_event.${rule.event_name} for contact=${contactId}`,
        );
      }
    } catch (err) {
      this.logger.warn(`[CLICK] Error processing click: ${err.message}`);
    }
  }

  private evaluateRule(conditions: Condition[], click: ClickPayload): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, click));
  }

  private evaluateCondition(condition: Condition, click: ClickPayload): boolean {
    let actual = '';

    switch (condition.field) {
      case 'tag':
        actual = (click.tag ?? '').toLowerCase();
        break;
      case 'id':
        actual = (click.id ?? '').toLowerCase();
        break;
      case 'class':
        actual = (click.classes ?? []).join(' ').toLowerCase();
        break;
      case 'text':
        actual = (click.text ?? '').toLowerCase();
        break;
      case 'href':
        actual = (click.href ?? '').toLowerCase();
        break;
      case 'path':
        actual = (click.path ?? '').toLowerCase();
        break;
      case 'url':
        actual = (click.url ?? '').toLowerCase();
        break;
      case 'attr':
        actual = (click.attrs?.[condition.attr ?? ''] ?? '').toLowerCase();
        break;
      default:
        return true;
    }

    const expected = (condition.value ?? '').toLowerCase();

    switch (condition.operator) {
      case 'is':               return actual === expected;
      case 'is_not':           return actual !== expected;
      case 'contains':         return actual.includes(expected);
      case 'does_not_contain': return !actual.includes(expected);
      case 'starts_with':      return actual.startsWith(expected);
      case 'exists':           return actual.length > 0;
      default:                 return true;
    }
  }

  private buildProperties(
    properties: { static: Record<string, any>; dynamic: DynamicProperty[] },
    click: ClickPayload,
  ): Record<string, any> {
    const result: Record<string, any> = { ...properties.static };

    for (const d of properties.dynamic ?? []) {
      switch (d.source) {
        case 'attr':
          result[d.key] = click.attrs?.[d.attr ?? ''] ?? null;
          break;
        case 'text':
          result[d.key] = click.text ?? null;
          break;
        case 'href':
          result[d.key] = click.href ?? null;
          break;
        case 'id':
          result[d.key] = click.id ?? null;
          break;
        case 'class':
          result[d.key] = (click.classes ?? []).join(' ') || null;
          break;
      }
    }

    return result;
  }
}
