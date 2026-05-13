import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { PostmarkService } from '@/modules/postmark/postmark.service';
import { EmailTemplatesService } from '@/modules/email-templates/email-templates.service';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class SendEmailExecutor implements IActionExecutor {
  private readonly logger = new Logger(SendEmailExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly postmarkService: PostmarkService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    try {
      this.logger.log(
        `📧 Executing send_email action for contact ${context.contactId}`,
      );

      // 1. Get contact information
      const contact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      // 2. Check if contact email is valid
      if (!contact.email) {
        return {
          success: false,
          skipped: true,
          reason: 'Contact has no email address',
        };
      }

      // 3. Check if contact is unsubscribed
      if (contact.status === 0) {
        return {
          success: false,
          skipped: true,
          reason: 'Contact is unsubscribed',
        };
      }

      // 4. Check if contact has hard bounce
      if (contact.hard_bounce) {
        return {
          success: false,
          skipped: true,
          reason: 'Contact has hard bounced',
        };
      }

      // 5. Check blocklist
      const isBlocked = await this.knex('tbl_contact_blocklist')
        .where({ contact_id: contact.id, user_id: context.userId })
        .first();

      if (isBlocked) {
        return {
          success: false,
          skipped: true,
          reason: `Contact is blocklisted: ${isBlocked.reason}`,
        };
      }

      // 6. Prepare contact data for interpolation
      const contactData = {
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        attributes: contact.metadata?.attributes || {},
        // Add trigger data if available
        ...(context.triggerData || {}),
      };

      // 7. Resolve email content — load from template if templateId provided
      let resolvedHtml: string = config.htmlBody || config.html_body || '';
      let resolvedText: string | undefined = config.textBody;
      let resolvedSubject: string = config.subject || '';
      let resolvedPreviewText: string | undefined = config.previewText || config.preview_text;

      if (config.templateId) {
        const template = await this.emailTemplatesService.getEmailTemplateById(
          config.templateId,
          context.userId,
        );

        if (!template) {
          return {
            success: false,
            error: `Email template ${config.templateId} not found`,
          };
        }

        // Template content takes precedence; config fields override template defaults
        resolvedHtml = template.html_content || resolvedHtml;
        resolvedText = template.text_content || resolvedText;
        resolvedSubject = config.subject || template.subject || '';
        resolvedPreviewText = config.previewText || config.preview_text || template.preheader_text;
      }

      if (!resolvedHtml) {
        return {
          success: false,
          error: 'No email content: provide a templateId or htmlBody in the action config',
        };
      }

      // 8. Interpolate variables in subject and body
      const subject = this.postmarkService.interpolateVariables(resolvedSubject, contactData);
      const htmlBody = this.postmarkService.interpolateVariables(resolvedHtml, contactData);
      const textBody = resolvedText
        ? this.postmarkService.interpolateVariables(resolvedText, contactData)
        : undefined;
      const previewText = resolvedPreviewText
        ? this.postmarkService.interpolateVariables(resolvedPreviewText, contactData)
        : undefined;

      // 9. Send email via Postmark
      const result = await this.postmarkService.sendAndTrackEmail({
        userId: context.userId,
        contactId: contact.id,
        toEmail: contact.email,
        subject,
        htmlBody,
        textBody,
        previewText,
        fromEmail: config.fromEmail || config.from_email,
        fromName: config.fromName || config.from_name,
        replyTo: config.replyTo || config.reply_to,
        templateId: config.templateId,
        workflowId: context.workflowId,
        executionId: context.executionId,
        metadata: {
          actionType: 'send_email',
          workflowId: context.workflowId,
          executionId: context.executionId,
        },
      });

      this.logger.log(
        `✅ Email sent successfully: ${result.postmarkResult.MessageID}`,
      );

      return {
        success: true,
        data: {
          sentEmailId: result.sentEmail.id,
          messageId: result.postmarkResult.MessageID,
          to: result.postmarkResult.To,
          subject,
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
