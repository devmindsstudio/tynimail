import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

type BlockType = 'marketing' | 'all' | 'compliance';

@Injectable()
export class BlocklistContactExecutor implements IActionExecutor {
  private readonly logger = new Logger(BlocklistContactExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const blockType: BlockType = config.blockType || 'marketing';

    // 1. Load contact
    const contact = await this.knex('tbl_subscribers')
      .where({ id: context.contactId, user_id: context.userId })
      .first();

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    // 2. Apply the block
    await this.knex('tbl_subscribers')
      .where({ id: context.contactId })
      .update({ status: 0, updated_at: this.knex.fn.now() });

    // marketing block only touches status — no blocklist table entry
    if (blockType === 'all' || blockType === 'compliance') {
      const reason = blockType === 'compliance' ? 'compliance' : 'manual';

      await this.knex('tbl_contact_blocklist')
        .insert({
          user_id: context.userId,
          contact_id: context.contactId,
          email: contact.email,
          reason,
          notes: `Blocklisted via workflow ${context.workflowId}`,
        })
        .onConflict(['user_id', 'contact_id'])
        .ignore(); // already blocked — no error
    }

    this.logger.log(
      `[BLOCKLIST] Contact ${context.contactId} (${contact.email}) blocklisted — type=${blockType}`,
    );

    // 3. Emit event
    this.eventEmitter.emit('contact.blocklisted', {
      userId: context.userId,
      contactId: context.contactId,
      email: contact.email,
      blockType,
      source: 'workflow',
      workflowId: context.workflowId,
      executionId: context.executionId,
    });

    return {
      success: true,
      data: {
        contactId: context.contactId,
        email: contact.email,
        blockType,
        blockedAt: new Date(),
      },
    };
  }
}
