import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class DeleteContactExecutor implements IActionExecutor {
  private readonly logger = new Logger(DeleteContactExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const { contactId, userId, executionId } = context;

    // 1. Verify the contact exists
    const contact = await this.knex('tbl_subscribers')
      .where({ id: contactId, user_id: userId })
      .first();

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    const contactEmail = contact.email;
    this.logger.warn(
      `[DELETE-CONTACT] Deleting contact ${contactId} (${contactEmail}) — triggered by workflow ${context.workflowId}`,
    );

    await this.knex.transaction(async (trx) => {
      // Cancel other active executions for this contact before the contact row
      // is deleted (so we can write a cancellation reason to the status column).
      // The tbl_workflow_executions FK is ON DELETE CASCADE — rows would be
      // removed anyway, but we want the status to be 'cancelled' not just gone.
      await trx('tbl_workflow_executions')
        .where({ contact_id: contactId })
        .whereIn('status', ['running', 'waiting', 'waiting_for_event'])
        .whereNot({ id: executionId }) // current execution handled by engine
        .update({
          status: 'cancelled',
          completed_at: trx.fn.now(),
          updated_at: trx.fn.now(),
          error: 'Contact was deleted',
        });

      // Delete the contact — FK cascades handle everything else:
      //   tbl_sent_emails         ON DELETE CASCADE
      //   tbl_email_events        ON DELETE CASCADE (via contact_id FK)
      //   tbl_subscriber_segment  ON DELETE CASCADE
      //   tbl_contact_blocklist   ON DELETE CASCADE
      //   tbl_event_waiters       ON DELETE CASCADE
      //   tbl_delayed_executions  ON DELETE CASCADE
      //   tbl_custom_events       ON DELETE CASCADE
      //   tbl_workflow_executions ON DELETE CASCADE (current execution goes here too)
      //   tbl_page_views          ON DELETE SET NULL
      //   tbl_form_submissions    ON DELETE SET NULL
      await trx('tbl_subscribers').where({ id: contactId }).delete();
    });

    this.logger.log(
      `[DELETE-CONTACT] Contact ${contactId} (${contactEmail}) deleted`,
    );

    return {
      success: true,
      contactDeleted: true, // signals the execution engine to stop walking
      data: {
        contactId,
        email: contactEmail,
        deletedAt: new Date(),
      },
    };
  }
}
