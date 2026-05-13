import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import axios from 'axios';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

const MAX_BODY_SIZE = 10_000; // characters

@Injectable()
export class CallWebhookExecutor implements IActionExecutor {
  private readonly logger = new Logger(CallWebhookExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    // 1. Validate URL
    if (!config.url) {
      return { success: false, error: 'url is required in config' };
    }
    if (!this.isValidUrl(config.url)) {
      return { success: false, error: `Invalid webhook URL: ${config.url}` };
    }

    // 2. Build payload
    const payload: Record<string, any> = {
      contactId: context.contactId,
      workflowId: context.workflowId,
      executionId: context.executionId,
      timestamp: new Date().toISOString(),
    };

    if (config.includeContactDetails) {
      const contact = await this.knex('tbl_subscribers')
        .where({ id: context.contactId, user_id: context.userId })
        .first();

      if (contact) {
        const lists = await this.knex('tbl_subscriber_segment')
          .where({ subscriber_id: context.contactId })
          .pluck('segment_id');

        payload.contact = {
          id: contact.id,
          email: contact.email,
          firstName: contact.first_name,
          lastName: contact.last_name,
          attributes: contact.metadata?.attributes || {},
          lists,
          createdAt: contact.created_at,
        };
      }
    }

    if (config.includeTriggerEvent && context.triggerData) {
      payload.trigger = context.triggerData;
    }

    // 3. Fire the request
    const startTime = Date.now();
    let statusCode: number | undefined;
    let responseBody: any;
    let errorMsg: string | undefined;

    try {
      const response = await axios.post(config.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TyniMail-Webhook/1.0',
          'X-Workflow-Id': context.workflowId,
          'X-Execution-Id': context.executionId,
        },
        timeout: 30_000,
        validateStatus: () => true, // never throw on HTTP error status
      });

      statusCode = response.status;
      responseBody = response.data;
    } catch (err) {
      errorMsg = err.message;
    }

    const durationMs = Date.now() - startTime;
    const success =
      !errorMsg &&
      statusCode !== undefined &&
      statusCode >= 200 &&
      statusCode < 300;

    // 4. Log the call
    const requestStr = this.truncate(JSON.stringify(payload));
    const responseStr = responseBody
      ? this.truncate(
          typeof responseBody === 'string'
            ? responseBody
            : JSON.stringify(responseBody),
        )
      : null;

    try {
      await this.knex('tbl_webhook_logs').insert({
        user_id: context.userId,
        execution_id: context.executionId,
        workflow_id: context.workflowId,
        url: config.url,
        method: 'POST',
        request_body: requestStr,
        status_code: statusCode ?? null,
        response_body: responseStr,
        success,
        error: errorMsg ?? null,
        duration_ms: durationMs,
      });
    } catch (logErr) {
      // Don't let a log failure fail the action
      this.logger.error(`[WEBHOOK] Failed to write webhook log: ${logErr.message}`);
    }

    this.logger.log(
      `[WEBHOOK] POST ${config.url} → ${statusCode ?? 'ERR'} (${durationMs}ms)`,
    );

    // 5. Return result
    if (errorMsg) {
      return {
        success: false,
        error: errorMsg,
        data: { url: config.url, durationMs },
      };
    }

    return {
      success,
      error: success ? undefined : `Webhook returned HTTP ${statusCode}`,
      data: { url: config.url, statusCode, durationMs },
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
      return false;
    }
  }

  private truncate(str: string): string {
    return str.length > MAX_BODY_SIZE ? str.slice(0, MAX_BODY_SIZE) + '…' : str;
  }
}
