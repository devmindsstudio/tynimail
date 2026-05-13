import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';

@Injectable()
export class PostmarkWebhookService {
  private readonly logger = new Logger(PostmarkWebhookService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process incoming Postmark webhook
   * Handles: Delivery, Bounce, Open, Click, SpamComplaint events
   */
  async processWebhook(payload: any): Promise<void> {
    const { RecordType, MessageID, ReceivedAt } = payload;

    this.logger.log(
      `📬 Received webhook: ${RecordType} for message ${MessageID}`,
    );

    try {
      // 1. Find the sent email
      const sentEmail = await this.knex('tbl_sent_emails')
        .where({ postmark_message_id: MessageID })
        .first();

      if (!sentEmail) {
        this.logger.warn(
          `⚠️  Sent email not found for MessageID: ${MessageID}`,
        );
        return;
      }

      // 2. Map Postmark event type to our event type
      const eventType = this.mapPostmarkEventType(RecordType);

      // 3. Store email event
      await this.knex('tbl_email_events').insert({
        user_id: sentEmail.user_id,
        contact_id: sentEmail.contact_id,
        sent_email_id: sentEmail.id,
        event_type: eventType,
        link_url: payload.OriginalLink || null,
        metadata: JSON.stringify({
          user_agent: payload.UserAgent || null,
          ip_address: payload.RecipientIP || null,
          os: payload.OS || null,
          device: payload.Device || null,
        }),
        is_apple_privacy: this.isAppleMailPrivacy(payload),
        bounce_type: payload.Type || null,
        bounce_description: payload.Description || null,
        event_at: payload.ReceivedAt,
        created_at: this.knex.fn.now(),
      });

      this.logger.log(
        `✅ Email event stored: ${eventType} for ${sentEmail.to_email}`,
      );

      // 4. Update sent email stats
      await this.updateSentEmailStats(sentEmail.id, eventType, payload);

      // 5. Update contact bounce status if needed
      if (eventType === 'bounced') {
        await this.updateContactBounceStatus(
          sentEmail.user_id,
          sentEmail.contact_id,
          payload.Type,
        );
      }

      // 6. Emit event for workflow triggers
      this.eventEmitter.emit(`email.${eventType}`, {
        userId: sentEmail.user_id,
        contactId: sentEmail.contact_id,
        sentEmailId: sentEmail.id,
        messageId: MessageID,
        linkUrl: payload.OriginalLink || null,
        eventType,
        occurredAt: ReceivedAt,
      });

      this.logger.log(
        `🎯 Webhook processed successfully and event emitted: email.${eventType}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Map Postmark RecordType to our email event types
   */
  private mapPostmarkEventType(recordType: string): string {
    const mapping: Record<string, string> = {
      Delivery: 'delivered',
      Bounce: 'bounced',
      Open: 'opened',
      Click: 'clicked',
      SpamComplaint: 'spam_complaint',
      SubscriptionChange: 'unsubscribed',
    };

    return mapping[recordType] || recordType.toLowerCase();
  }

  /**
   * Check if this is an Apple Mail Privacy Protection open
   */
  private isAppleMailPrivacy(payload: any): boolean {
    // Apple MPP opens typically have specific user agent patterns
    const userAgent = payload.UserAgent || '';
    return (
      userAgent.includes('AppleWebKit') ||
      userAgent.includes('Safari') ||
      payload.Tag === 'ApplePrivacy'
    );
  }

  /**
   * Update sent email statistics based on event type
   */
  private async updateSentEmailStats(
    sentEmailId: string,
    eventType: string,
    payload: any,
  ): Promise<void> {
    const updates: any = {
      updated_at: this.knex.fn.now(),
    };

    switch (eventType) {
      case 'delivered':
        updates.status = 'delivered';
        updates.delivered_at = this.knex.fn.now();
        await this.incrementSubscriberMetadataKey(
          payload.MessageID,
          'delivered',
          false,
        );
        break;

      case 'opened':
        updates.open_count = this.knex.raw('open_count + 1');
        // Only set first_opened_at if it's null
        const email = await this.knex('tbl_sent_emails')
          .where({ id: sentEmailId })
          .first();
        if (!email.first_opened_at) {
          updates.first_opened_at = this.knex.fn.now();
        }
        await this.incrementSubscriberMetadataKey(
          payload.MessageID,
          'open',
          true,
        );
        break;

      case 'clicked':
        updates.click_count = this.knex.raw('click_count + 1');
        // Only set first_clicked_at if it's null
        const emailForClick = await this.knex('tbl_sent_emails')
          .where({ id: sentEmailId })
          .first();
        if (!emailForClick.first_clicked_at) {
          updates.first_clicked_at = this.knex.fn.now();
        }
        await this.incrementSubscriberMetadataKey(
          payload.MessageID,
          'click',
          true,
        );
        break;

      case 'bounced':
        updates.status = 'bounced';
        updates.bounced_at = this.knex.fn.now();
        updates.error = payload.Description || null;
        break;

      case 'spam_complaint':
        updates.status = 'spam';
        break;

      default:
        break;
    }

    if (Object.keys(updates).length > 1) {
      await this.knex('tbl_sent_emails')
        .where({ id: sentEmailId })
        .update(updates);
    }
  }

  /**
   * Update contact bounce status in tbl_subscribers
   */
  private async updateContactBounceStatus(
    userId: string,
    contactId: string,
    bounceType: string,
  ): Promise<void> {
    if (bounceType === 'HardBounce') {
      // Mark contact as hard bounced
      await this.knex('tbl_subscribers')
        .where({ id: contactId, user_id: userId })
        .update({
          hard_bounce: true,
          updated_at: this.knex.fn.now(),
        });

      this.logger.warn(`⚠️  Contact ${contactId} marked as hard bounced`);
    } else if (bounceType === 'SoftBounce') {
      // Increment soft bounce count
      await this.knex('tbl_subscribers')
        .where({ id: contactId, user_id: userId })
        .update({
          soft_bounce_count: this.knex.raw('soft_bounce_count + 1'),
          updated_at: this.knex.fn.now(),
        });

      this.logger.log(`Soft bounce count incremented for contact ${contactId}`);
    }
  }

  /**
   * Get email events for a sent email
   */
  async getEmailEvents(sentEmailId: string): Promise<any[]> {
    return this.knex('tbl_email_events')
      .where({ sent_email_id: sentEmailId })
      .orderBy('event_at', 'asc');
  }

  /**
   * Get email events for a contact
   */
  async getContactEmailEvents(
    userId: string,
    contactId: string,
    eventType?: string,
  ): Promise<any[]> {
    const query = this.knex('tbl_email_events')
      .where({
        user_id: userId,
        contact_id: contactId,
      })
      .orderBy('event_at', 'desc');

    if (eventType) {
      query.where({ event_type: eventType });
    }

    return query;
  }

  private async incrementSubscriberMetadataKey(
    sentEmailId: string,
    key: 'open' | 'click' | 'unique' | 'delivered',
    activity: boolean = false, // optional to add activity or not, as we want to only add activity for user related actions (for instance click, open, etc.)
    amount = 1,
  ) {
    const [subscriberID] = await this.knex('tbl_sent_emails')
      .select('contact_id')
      .where('postmark_message_id', '=', sentEmailId);

    await this.knex('tbl_subscribers')
      .where('id', '=', subscriberID.contact_id)
      .update({
        metadata: this.knex.raw(
          `
        jsonb_set(
          COALESCE(metadata, '{}')::jsonb,
          :path,
          (COALESCE((metadata->>:key), '0')::int + :amount)::text::jsonb
        )
      `,
          {
            path: `{${key}}`, // e.g. "{open}"
            key, // e.g. "open" — used as a text value, not identifier
            amount,
          },
        ),
        last_activity_at: activity === true ? this.knex.fn.now() : null,
      });
    this.logger.log(
      `Metadata Key '${key}' incremented for contact ${subscriberID.contact_id}`,
    );
  }
}
