import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { TriggerQueueProducer } from '@/modules/queues/producers/trigger-queue.producer';
import { EventWaiterQueueProducer } from '@/modules/queues/producers/event-waiter-queue.producer';

/**
 * TriggerEventBridgeService
 *
 * Thin bridge between EventEmitter2 events and BullMQ queues.
 * Each handler enqueues to:
 *   1. trigger-queue  — to start new workflow executions that match the event type
 *   2. event-waiter-queue — to resolve parked wait-for-event executions
 */
@Injectable()
export class TriggerEventBridgeService {
  private readonly logger = new Logger(TriggerEventBridgeService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private triggerQueueProducer: TriggerQueueProducer,
    private eventWaiterQueueProducer: EventWaiterQueueProducer,
  ) {}

  @OnEvent('contact.added_to_list')
  async handleContactAddedToList(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('contact_added_to_list', {
        userId: payload.userId,
        contactId: payload.contactId,
        listId: payload.listId,
        listName: payload.listName,
        source: payload.source,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'contact_added_to_list',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for contact.added_to_list: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('contact.removed_from_list')
  async handleContactRemovedFromList(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('contact_removed_from_list', {
        userId: payload.userId,
        contactId: payload.contactId,
        listId: payload.listId,
        listName: payload.listName,
        source: payload.source,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'contact_removed_from_list',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for contact.removed_from_list: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('email.opened')
  async handleEmailOpened(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('email_opened', {
        userId: payload.userId,
        contactId: payload.contactId,
        sentEmailId: payload.sentEmailId,
        messageId: payload.messageId,
        isAppleMpp: payload.isAppleMpp,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'email_opened',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for email.opened: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('email.clicked')
  async handleEmailClicked(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('link_clicked', {
        userId: payload.userId,
        contactId: payload.contactId,
        sentEmailId: payload.sentEmailId,
        messageId: payload.messageId,
        linkUrl: payload.linkUrl,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'email_clicked',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for email.clicked: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('email.unsubscribed')
  async handleEmailUnsubscribed(payload: any) {
    try {
      // Mark the contact as unsubscribed in the DB
      await this.knex('tbl_subscribers')
        .where({ id: payload.contactId, user_id: payload.userId })
        .update({ status: 0, updated_at: this.knex.fn.now() });

      // Enqueue to trigger-queue so any 'unsubscribed' trigger workflows fire
      await this.triggerQueueProducer.enqueue('unsubscribed', {
        userId: payload.userId,
        contactId: payload.contactId,
        sentEmailId: payload.sentEmailId,
        messageId: payload.messageId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle email.unsubscribed: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('form.submitted')
  async handleFormSubmitted(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('form_submitted', {
        userId: payload.userId,
        contactId: payload.contactId,
        formId: payload.formId,
        formData: payload.formData,
        isNewContact: payload.isNewContact,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'form_submitted',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for form.submitted: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('custom_event.*')
  async handleCustomEvent(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('custom_event', {
        ...payload, // forward all fields including _element and _rule from element tracking
        userId: payload.userId,
        contactId: payload.contactId,
        eventName: payload.eventName,
        properties: payload.properties,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'custom_event',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for custom_event: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('webpage.visited')
  async handleWebpageVisited(payload: any) {
    try {
      await this.triggerQueueProducer.enqueue('webpage_visited', {
        userId: payload.userId,
        contactId: payload.contactId,
        siteId: payload.siteId,
        visitorId: payload.visitorId,
        url: payload.url,
        path: payload.path,
        title: payload.title,
        referrer: payload.referrer,
        timestamp: payload.timestamp,
      });
      await this.eventWaiterQueueProducer.enqueue(
        'webpage_visited',
        payload.userId,
        payload.contactId,
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue for webpage.visited: ${error.message}`,
        error.stack,
      );
    }
  }
}
