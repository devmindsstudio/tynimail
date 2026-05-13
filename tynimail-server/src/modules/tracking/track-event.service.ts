import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';

@Injectable()
export class TrackEventService {
  private readonly logger = new Logger(TrackEventService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private eventEmitter: EventEmitter2,
  ) {}

  async trackEvent(data: {
    siteId: string;
    event_name: string;
    properties?: Record<string, any>;
    event_data?: Record<string, any>;
  }): Promise<void> {
    try {
      // 1. Resolve user from siteId
      const user = await this.knex('tbl_users')
        .where({ site_id: data.siteId })
        .select('id')
        .first();

      if (!user) return;

      const userId: string = user.id;

      // 2. Extract email from properties — required for contact upsert
      const email: string | undefined = data.properties?.email?.toString().trim().toLowerCase();
      if (!email) return;

      // 3. Upsert contact
      const contactId = await this.upsertContact(userId, email, data.properties ?? {});
      if (!contactId) return;

      // 4. Build merged properties: event_data + any extra properties (strip contact fields)
      const { email: _e, FIRSTNAME: _f, LASTNAME: _l, ...extraProps } = data.properties ?? {};
      const mergedProperties = { ...(data.event_data ?? {}), ...extraProps };

      // 5. Insert into tbl_custom_events
      await this.knex('tbl_custom_events').insert({
        user_id: userId,
        contact_id: contactId,
        event_name: data.event_name,
        properties: JSON.stringify(mergedProperties),
        event_at: this.knex.fn.now(),
        created_at: this.knex.fn.now(),
      });

      // 6. Emit EventEmitter2 event → picked up by TriggerEventBridgeService → BullMQ
      this.eventEmitter.emit(`custom_event.${data.event_name}`, {
        userId,
        contactId,
        eventName: data.event_name,
        properties: mergedProperties,
      });

      this.logger.debug(
        `[TRACK-EVENT] custom_event.${data.event_name} emitted: contact=${contactId}`,
      );
    } catch (err) {
      // Non-fatal — tracking must never break customer websites
      this.logger.warn(
        `[TRACK-EVENT] Failed to process event "${data.event_name}": ${err.message}`,
      );
    }
  }

  private async upsertContact(
    userId: string,
    email: string,
    properties: Record<string, any>,
  ): Promise<string | null> {
    try {
      const existing = await this.knex('tbl_subscribers')
        .where({ user_id: userId, email, row_status: 1 })
        .select('id', 'first_name', 'last_name')
        .first();

      if (existing) {
        // Update first_name / last_name only if currently null
        const updates: Record<string, any> = {};
        if (!existing.first_name && properties.FIRSTNAME) {
          updates.first_name = properties.FIRSTNAME;
        }
        if (!existing.last_name && properties.LASTNAME) {
          updates.last_name = properties.LASTNAME;
        }
        if (Object.keys(updates).length > 0) {
          updates.updated_at = this.knex.fn.now();
          await this.knex('tbl_subscribers')
            .where({ id: existing.id })
            .update(updates);
        }
        return existing.id;
      }

      // Create new contact
      const [inserted] = await this.knex('tbl_subscribers')
        .insert({
          email,
          first_name: properties.FIRSTNAME || null,
          last_name: properties.LASTNAME || null,
          status: 1,
          user_id: userId,
          row_status: 1,
          source: 'single_import',
        })
        .returning('id');

      return inserted.id;
    } catch (err) {
      this.logger.warn(`[TRACK-EVENT] Contact upsert failed for ${email}: ${err.message}`);
      return null;
    }
  }
}
