import { Injectable, Logger } from '@nestjs/common';
import { ActionExecutionContext, ActionExecutionResult } from './interfaces';
import {
  SendEmailExecutor,
  AddToListExecutor,
  RemoveFromListExecutor,
  UpdateContactExecutor,
  NotifyEmailExecutor,
  CallWebhookExecutor,
  BlocklistContactExecutor,
  AssignUserExecutor,
  DeleteContactExecutor,
} from './executors';

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);

  constructor(
    private readonly sendEmailExecutor: SendEmailExecutor,
    private readonly addToListExecutor: AddToListExecutor,
    private readonly removeFromListExecutor: RemoveFromListExecutor,
    private readonly updateContactExecutor: UpdateContactExecutor,
    private readonly notifyEmailExecutor: NotifyEmailExecutor,
    private readonly callWebhookExecutor: CallWebhookExecutor,
    private readonly blocklistContactExecutor: BlocklistContactExecutor,
    private readonly assignUserExecutor: AssignUserExecutor,
    private readonly deleteContactExecutor: DeleteContactExecutor,
  ) {}

  /**
   * Execute an action based on its type
   * This is the main dispatcher for all action types
   */
  async executeAction(
    actionType: string,
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    this.logger.log(
      `🎯 Executing action: ${actionType} for contact ${context.contactId}`,
    );

    try {
      let result: ActionExecutionResult;

      switch (actionType) {
        case 'send_email':
          result = await this.sendEmailExecutor.execute(config, context);
          break;

        case 'add_to_list':
          result = await this.addToListExecutor.execute(config, context);
          break;

        case 'remove_from_list':
          result = await this.removeFromListExecutor.execute(config, context);
          break;

        case 'update_contact':
          result = await this.updateContactExecutor.execute(config, context);
          break;

        case 'notify_email':
          result = await this.notifyEmailExecutor.execute(config, context);
          break;

        case 'call_webhook':
          result = await this.callWebhookExecutor.execute(config, context);
          break;

        case 'blocklist_contact':
          result = await this.blocklistContactExecutor.execute(config, context);
          break;

        case 'assign_user':
          result = await this.assignUserExecutor.execute(config, context);
          break;

        case 'delete_contact':
          result = await this.deleteContactExecutor.execute(config, context);
          break;

        default:
          this.logger.error(`❌ Unknown action type: ${actionType}`);
          return {
            success: false,
            error: `Unknown action type: ${actionType}`,
          };
      }

      if (result.success) {
        this.logger.log(
          `✅ Action ${actionType} completed successfully${result.skipped ? ' (skipped)' : ''}`,
        );
      } else {
        this.logger.error(`❌ Action ${actionType} failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Unexpected error executing action ${actionType}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute multiple actions in sequence
   * Useful for batch operations or workflow steps
   */
  async executeActions(
    actions: Array<{ type: string; config: any }>,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult[]> {
    const results: ActionExecutionResult[] = [];

    for (const action of actions) {
      const result = await this.executeAction(
        action.type,
        action.config,
        context,
      );
      results.push(result);

      // Stop if an action fails (unless configured to continue)
      if (!result.success && !result.skipped) {
        this.logger.warn(
          `⚠️ Stopping action sequence due to failure at action: ${action.type}`,
        );
        break;
      }
    }

    return results;
  }

  /**
   * Validate action configuration before execution
   */
  validateActionConfig(actionType: string, config: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (actionType) {
      case 'send_email':
        if (!config.subject) errors.push('subject is required');
        if (!config.htmlBody && !config.html_body) {
          errors.push('htmlBody is required');
        }
        break;

      case 'add_to_list':
      case 'remove_from_list':
        if (!config.listId && !config.list_id && !config.segmentId) {
          errors.push('listId is required');
        }
        break;

      case 'update_contact':
        if (
          !config.firstName &&
          !config.lastName &&
          !config.email &&
          !config.phone &&
          !config.attribute &&
          !config.attributes
        ) {
          errors.push('At least one field to update is required');
        }
        break;

      case 'notify_email':
        if (
          config.recipients?.type === 'specific' &&
          !config.recipients?.emails?.length
        ) {
          errors.push('At least one recipient email is required');
        }
        if (
          config.recipients?.type === 'attribute' &&
          !config.recipients?.attributeKey
        ) {
          errors.push('attributeKey is required for attribute recipient type');
        }
        if (!config.content?.subject) errors.push('subject is required');
        if (!config.content?.body) errors.push('body is required');
        break;

      case 'call_webhook':
        if (!config.url) {
          errors.push('url is required');
        } else {
          try {
            new URL(config.url);
          } catch {
            errors.push('url must be a valid URL');
          }
        }
        break;

      case 'blocklist_contact':
        if (!['marketing', 'all', 'compliance'].includes(config.blockType)) {
          errors.push('blockType must be marketing, all, or compliance');
        }
        break;

      case 'assign_user':
        if (!['specific', 'round_robin'].includes(config.assignmentType)) {
          errors.push('assignmentType must be specific or round_robin');
        }
        if (config.assignmentType === 'specific' && !config.userId) {
          errors.push('userId is required for specific assignment');
        }
        if (
          config.assignmentType === 'round_robin' &&
          !config.userIds?.length
        ) {
          errors.push('userIds array is required for round_robin assignment');
        }
        break;

      case 'delete_contact':
        // No config required
        break;

      default:
        errors.push(`Unknown action type: ${actionType}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
