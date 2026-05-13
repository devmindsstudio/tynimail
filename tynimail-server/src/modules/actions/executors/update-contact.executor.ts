import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class UpdateContactExecutor implements IActionExecutor {
  private readonly logger = new Logger(UpdateContactExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    try {
      this.logger.log(
        `Updating contact ${context.contactId} with config:`,
        config,
      );

      // 1. Get current contact
      const contact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      // 2. Prepare updates based on config
      const updates: any = {
        updated_at: this.knex.fn.now(),
      };

      // Handle standard fields
      if (config.firstName !== undefined) updates.first_name = config.firstName;
      if (config.lastName !== undefined) updates.last_name = config.lastName;
      if (config.email !== undefined) updates.email = config.email;
      if (config.phone !== undefined) updates.phone = config.phone;

      // Handle attribute updates
      if (config.attribute && config.value !== undefined) {
        // Update specific attribute in metadata.attributes
        const metadata = contact.metadata || { stats: {}, attributes: {} };
        if (!metadata.attributes) metadata.attributes = {};

        metadata.attributes[config.attribute] = config.value;
        updates.metadata = JSON.stringify(metadata);
      }

      // Handle multiple attributes at once — flat object { KEY: value } or array [{field, value}]
      if (config.attributes) {
        const metadata = contact.metadata || { stats: {}, attributes: {} };
        if (!metadata.attributes) metadata.attributes = {};

        if (Array.isArray(config.attributes)) {
          // Frontend array format: [{ field: 'FIRSTNAME', value: 'Alice' }, ...]
          for (const entry of config.attributes) {
            if (entry.field !== undefined && entry.value !== undefined) {
              metadata.attributes[entry.field] = entry.value;
            }
          }
        } else if (typeof config.attributes === 'object') {
          // Legacy flat object: { FIRSTNAME: 'Alice', ... }
          metadata.attributes = { ...metadata.attributes, ...config.attributes };
        }

        updates.metadata = JSON.stringify(metadata);
      }

      // Handle subscription status
      if (config.subscriptionStatus !== undefined) {
        // Map to status field (1=active, 0=inactive)
        updates.status = config.subscriptionStatus === 'subscribed' ? 1 : 0;
      }

      // 3. Perform update
      const updatedRows = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .update(updates);

      if (updatedRows === 0) {
        return {
          success: false,
          error: 'Failed to update contact',
        };
      }

      // 4. Get updated contact
      const updatedContact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();

      this.logger.log(`Contact ${context.contactId} updated successfully`);

      // 5. Emit event for potential workflow triggers
      this.eventEmitter.emit('contact.updated', {
        userId: context.userId,
        contactId: context.contactId,
        updates: config,
        source: 'workflow',
        workflowId: context.workflowId,
        executionId: context.executionId,
      });

      return {
        success: true,
        data: {
          contactId: context.contactId,
          updates: Object.keys(updates).filter(k => k !== 'updated_at'),
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to update contact: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
