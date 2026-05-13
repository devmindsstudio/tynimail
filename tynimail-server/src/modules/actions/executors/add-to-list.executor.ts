import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class AddToListExecutor implements IActionExecutor {
  private readonly logger = new Logger(AddToListExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    try {
      const listId = config.listId || config.list_id || config.segmentId;

      if (!listId) {
        return {
          success: false,
          error: 'listId is required in config',
        };
      }

      this.logger.log(
        `📋 Adding contact ${context.contactId} to list ${listId}`,
      );

      // 1. Verify contact exists
      const contact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      // 2. Verify list/segment exists
      const list = await this.knex('tbl_segments')
        .where({ id: listId, user_id: context.userId })
        .first();

      if (!list) {
        return {
          success: false,
          error: 'List not found',
        };
      }

      // 3. Check if contact is already in the list
      const existing = await this.knex('tbl_subscriber_segment')
        .where({
          subscriber_id: context.contactId,
          segment_id: listId,
        })
        .first();

      if (existing) {
        return {
          success: true,
          skipped: true,
          reason: 'Contact already in list',
          data: {
            contactId: context.contactId,
            listId,
            listName: list.name,
          },
        };
      }

      // 4. Add contact to list
      await this.knex('tbl_subscriber_segment').insert({
        subscriber_id: context.contactId,
        segment_id: listId,
        source: 'workflow',
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });

      this.logger.log(
        `✅ Contact ${context.contactId} added to list ${list.name}`,
      );

      // 5. Emit event for potential workflow triggers
      this.eventEmitter.emit('contact.added_to_list', {
        userId: context.userId,
        contactId: context.contactId,
        listId,
        listName: list.name,
        source: 'workflow',
        workflowId: context.workflowId,
        executionId: context.executionId,
      });

      return {
        success: true,
        data: {
          contactId: context.contactId,
          listId,
          listName: list.name,
          addedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to add to list: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
