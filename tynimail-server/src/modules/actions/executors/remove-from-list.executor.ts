import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class RemoveFromListExecutor implements IActionExecutor {
  private readonly logger = new Logger(RemoveFromListExecutor.name);

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
        `🗑️ Removing contact ${context.contactId} from list ${listId}`,
      );

      // 1. Verify list exists
      const list = await this.knex('tbl_segments')
        .where({ id: listId, user_id: context.userId })
        .first();

      if (!list) {
        return {
          success: false,
          error: 'List not found',
        };
      }

      // 2. Check if contact is in the list
      const existing = await this.knex('tbl_subscriber_segment')
        .where({
          subscriber_id: context.contactId,
          segment_id: listId,
        })
        .first();

      if (!existing) {
        return {
          success: true,
          skipped: true,
          reason: 'Contact not in list',
          data: {
            contactId: context.contactId,
            listId,
            listName: list.name,
          },
        };
      }

      // 3. Remove contact from list
      await this.knex('tbl_subscriber_segment')
        .where({
          subscriber_id: context.contactId,
          segment_id: listId,
        })
        .delete();

      this.logger.log(
        `✅ Contact ${context.contactId} removed from list ${list.name}`,
      );

      // 4. Emit event for potential workflow triggers
      this.eventEmitter.emit('contact.removed_from_list', {
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
          removedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to remove from list: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
