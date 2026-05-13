import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { PostmarkService } from '@/modules/postmark/postmark.service';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class NotifyEmailExecutor implements IActionExecutor {
  private readonly logger = new Logger(NotifyEmailExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly postmarkService: PostmarkService,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    // 1. Determine recipients
    let recipientEmails: string[] = [];

    if (config.recipients?.type === 'specific') {
      recipientEmails = (config.recipients.emails || []).filter(
        (e: string) => typeof e === 'string' && e.includes('@'),
      );
    } else if (config.recipients?.type === 'attribute') {
      const contact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();
      const attrEmail =
        contact?.metadata?.attributes?.[config.recipients.attributeKey];
      if (attrEmail && typeof attrEmail === 'string') {
        recipientEmails = [attrEmail];
      }
    }

    if (recipientEmails.length === 0) {
      this.logger.warn(
        `[NOTIFY-EMAIL] No valid recipients for contact ${context.contactId} — skipping`,
      );
      return { success: true, skipped: true, reason: 'No valid recipients' };
    }

    // 2. Load contact for variable interpolation
    const contact = await this.knex('tbl_subscribers')
      .where({ id: context.contactId, user_id: context.userId })
      .first();

    // 3. Build variable map
    const vars: Record<string, any> = {
      firstName: contact?.first_name || '',
      lastName: contact?.last_name || '',
      email: contact?.email || '',
      attributes: contact?.metadata?.attributes || {},
      trigger: context.triggerData || {},
    };

    const subject = this.interpolate(
      config.content?.subject || 'Workflow notification',
      vars,
    );
    const body = this.interpolate(config.content?.body || '', vars);

    // 4. Resolve sender — fall back to a shared address if none configured
    const fromEmail =
      config.sender?.email ||
      `notifications@tynimail.io`;

    // 5. Send to each recipient
    const results: Array<{ email: string; success: boolean; error?: string }> =
      [];

    for (const toEmail of recipientEmails) {
      try {
        await this.postmarkService.sendEmail({
          From: fromEmail,
          To: toEmail,
          Subject: subject,
          HtmlBody: body,
          MessageStream: 'outbound',
        });
        results.push({ email: toEmail, success: true });
        this.logger.log(`[NOTIFY-EMAIL] Sent to ${toEmail} — "${subject}"`);
      } catch (err) {
        results.push({ email: toEmail, success: false, error: err.message });
        this.logger.error(
          `[NOTIFY-EMAIL] Failed to send to ${toEmail}: ${err.message}`,
        );
      }
    }

    const allOk = results.every((r) => r.success);

    return {
      success: allOk,
      data: { recipients: results, subject, from: fromEmail },
      error: allOk
        ? undefined
        : 'One or more notification emails failed to send',
    };
  }

  /**
   * Replace {{key}} and {{nested.key}} placeholders with values from vars.
   */
  private interpolate(template: string, vars: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
      const parts = path.trim().split('.');
      let val: any = vars;
      for (const part of parts) {
        val = val != null && typeof val === 'object' ? val[part] : undefined;
      }
      return val != null ? String(val) : '';
    });
  }
}
