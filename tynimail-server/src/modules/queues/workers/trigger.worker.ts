import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Knex } from 'knex';
import { FilterEvaluationService } from '@/modules/triggers/services/filter-evaluation.service';

export interface ExecutionJobData {
  executionId: string;
  workflowId: string;
  contactId: string;
  userId: string;
  startFromNodeId: string | null;
  resumeBranch?: string;
  triggerData?: Record<string, any>;
}

@Processor('trigger-queue')
export class TriggerWorker extends WorkerHost {
  private readonly logger = new Logger(TriggerWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private filterEvaluationService: FilterEvaluationService,
    @InjectQueue('execution-queue') private executionQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { triggerType, eventData } = job.data;
    const { userId, contactId } = eventData;

    this.logger.log(
      `[TRIGGER-WORKER] Processing: type=${triggerType} contact=${contactId} userId=${userId}`,
    );

    // Direct DB query scoped by userId — no cache, always current
    const workflows = await this.knex('tbl_workflows')
      .where({ status: 'active', user_id: userId })
      .whereRaw(`triggers::jsonb @> ?::jsonb`, [
        JSON.stringify([{ subtype: triggerType }]),
      ])
      .select('*');

    if (workflows.length === 0) {
      this.logger.log(
        `[TRIGGER-WORKER] No active workflows for type=${triggerType} userId=${userId}`,
      );
      return;
    }

    this.logger.log(
      `[TRIGGER-WORKER] Found ${workflows.length} workflow(s) to evaluate`,
    );

    for (const workflow of workflows) {
      try {
        // Parse triggers JSONB
        const triggers =
          typeof workflow.triggers === 'string'
            ? JSON.parse(workflow.triggers)
            : workflow.triggers ?? [];

        const triggerNode = triggers.find(
          (t: any) => (t.subtype || t.type) === triggerType,
        );

        // Enforce primary scoping conditions per trigger type
        // These are hard identity checks — separate from user-defined filters
        if (!this.matchesPrimaryConfig(triggerType, triggerNode?.config, eventData, workflow.name)) {
          continue;
        }

        // Evaluate trigger filters
        const matches = await this.evaluateTriggerFilters(
          triggerNode?.config,
          eventData,
          userId,
          contactId,
        );

        if (!matches) {
          this.logger.log(
            `[TRIGGER-WORKER] Contact ${contactId} did not pass filters for workflow "${workflow.name}"`,
          );
          continue;
        }

        // For webpage_visited: also evaluate URL/page conditions
        if (triggerType === 'webpage_visited') {
          const passesUrlFilters = this.evaluateWebsiteFilters(
            triggerNode?.config?.websiteFilters?.conditions || [],
            eventData,
          );
          if (!passesUrlFilters) {
            this.logger.log(
              `[TRIGGER-WORKER] Contact ${contactId} — URL filters not matched for workflow "${workflow.name}"`,
            );
            continue;
          }
        }

        // Check allow_reentry
        if (!workflow.allow_reentry) {
          const hasActive = await this.hasActiveExecution(
            workflow.id,
            contactId,
          );
          if (hasActive) {
            this.logger.log(
              `[TRIGGER-WORKER] Skipping "${workflow.name}": contact has active execution (allow_reentry=false)`,
            );
            continue;
          }
        }

        // Record custom events in history table (Fix 6)
        if (triggerType === 'custom_event') {
          await this.recordCustomEvent(userId, contactId, eventData);
        }

        // Create execution record in DB
        const executionId = await this.createExecution(
          workflow,
          triggerNode,
          eventData,
          contactId,
          userId,
        );

        // Enqueue execution job
        await this.executionQueue.add(
          'run-execution',
          {
            executionId,
            workflowId: workflow.id,
            contactId,
            userId,
            startFromNodeId: null,
            triggerData: eventData,
          } satisfies ExecutionJobData,
          {
            attempts: 1,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 500 },
          },
        );

        this.logger.log(
          `[TRIGGER-WORKER] Execution ${executionId} created and enqueued for workflow "${workflow.name}"`,
        );
      } catch (error) {
        this.logger.error(
          `[TRIGGER-WORKER] Error processing workflow ${workflow.id} ("${workflow.name}"): ${error.message}`,
          error.stack,
        );
        // Continue to next workflow — don't fail the whole job for one bad workflow
      }
    }
  }

  private async evaluateTriggerFilters(
    triggerConfig: any,
    eventData: any,
    userId: string,
    contactId: string,
  ): Promise<boolean> {
    if (!triggerConfig?.filters) return true;

    const contact = await this.knex('tbl_subscribers')
      .where({ id: contactId, user_id: userId })
      .first();

    if (!contact) return false;

    const contactData = {
      ...contact,
      firstName: contact.first_name,
      lastName: contact.last_name,
      attributes: contact.metadata?.attributes || {},
      ...eventData,
    };

    return this.filterEvaluationService.evaluateFilters(
      triggerConfig.filters,
      contactData,
    );
  }

  private async hasActiveExecution(
    workflowId: string,
    contactId: string,
  ): Promise<boolean> {
    const row = await this.knex('tbl_workflow_executions')
      .where({ workflow_id: workflowId, contact_id: contactId })
      .whereIn('status', ['running', 'waiting', 'waiting_for_event'])
      .first();
    return !!row;
  }

  private async createExecution(
    workflow: any,
    triggerNode: any,
    eventData: any,
    contactId: string,
    userId: string,
  ): Promise<string> {
    const [execution] = await this.knex('tbl_workflow_executions')
      .insert({
        user_id: userId,
        workflow_id: workflow.id,
        contact_id: contactId,
        status: 'running',
        trigger_node_id: triggerNode?.nodeId ?? null,
        trigger_data: JSON.stringify(eventData),
        context: JSON.stringify({}),
        started_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('id');

    await this.knex('tbl_workflows')
      .where({ id: workflow.id })
      .increment('total_executions', 1)
      .increment('active_executions', 1);

    return execution.id;
  }

  private evaluateWebsiteFilters(
    conditions: Array<{ field: string; operator: string; value: string }>,
    eventData: any,
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    // All conditions must pass (AND logic)
    for (const condition of conditions) {
      const { field = 'url', operator, value } = condition;
      const actual =
        field === 'url' ? eventData.url :
        field === 'path' ? eventData.path :
        field === 'title' ? eventData.title :
        field === 'referrer' ? eventData.referrer : '';

      if (!this.evaluateStringOperator(operator, actual || '', value || '')) {
        return false;
      }
    }
    return true;
  }

  private evaluateStringOperator(operator: string, actual: string, expected: string): boolean {
    const a = actual.toLowerCase();
    const e = expected.toLowerCase();
    switch (operator) {
      case 'is_exactly':           return a === e;
      case 'is_not':               return a !== e;
      case 'contains':             return a.includes(e);
      case 'does_not_contain':     return !a.includes(e);
      case 'starts_with':          return a.startsWith(e);
      case 'does_not_start_with':  return !a.startsWith(e);
      case 'ends_with':            return a.endsWith(e);
      case 'does_not_end_with':    return !a.endsWith(e);
      default:                     return true;
    }
  }

  /**
   * Enforce primary scoping conditions per trigger type.
   * These are identity checks on the core config field (listId, eventName, etc.)
   * and run BEFORE user-defined filters.
   */
  private matchesPrimaryConfig(
    triggerType: string,
    config: any,
    eventData: any,
    workflowName: string,
  ): boolean {
    switch (triggerType) {
      case 'contact_added_to_list':
      case 'contact_removed_from_list': {
        if (config?.listId && config.listId !== eventData.listId) {
          this.logger.log(
            `[TRIGGER-WORKER] Skipping "${workflowName}": listId mismatch (configured="${config.listId}" event="${eventData.listId}")`,
          );
          return false;
        }
        return true;
      }

      case 'custom_event': {
        if (config?.eventName && config.eventName !== eventData.eventName) {
          this.logger.log(
            `[TRIGGER-WORKER] Skipping "${workflowName}": eventName mismatch (configured="${config.eventName}" event="${eventData.eventName}")`,
          );
          return false;
        }
        return true;
      }

      case 'form_submitted': {
        if (config?.formId && config.formId !== eventData.formId) {
          this.logger.log(
            `[TRIGGER-WORKER] Skipping "${workflowName}": formId mismatch (configured="${config.formId}" event="${eventData.formId}")`,
          );
          return false;
        }
        return true;
      }

      case 'email_opened': {
        if (config?.campaignId && config.campaignId !== eventData.campaignId) {
          this.logger.log(
            `[TRIGGER-WORKER] Skipping "${workflowName}": campaignId mismatch (configured="${config.campaignId}" event="${eventData.campaignId}")`,
          );
          return false;
        }
        return true;
      }

      case 'link_clicked': {
        if (config?.campaignId && config.campaignId !== eventData.campaignId) {
          this.logger.log(
            `[TRIGGER-WORKER] Skipping "${workflowName}": campaignId mismatch (configured="${config.campaignId}" event="${eventData.campaignId}")`,
          );
          return false;
        }
        if (config?.url && eventData.linkUrl) {
          const configuredUrl = config.url.toLowerCase();
          const firedUrl = eventData.linkUrl.toLowerCase();
          if (!firedUrl.includes(configuredUrl)) {
            this.logger.log(
              `[TRIGGER-WORKER] Skipping "${workflowName}": url mismatch (configured="${config.url}" event="${eventData.linkUrl}")`,
            );
            return false;
          }
        }
        return true;
      }

      default:
        return true;
    }
  }

  /**
   * Record a custom event in tbl_custom_events for audit/history.
   * Called once per event regardless of how many workflows matched.
   */
  private async recordCustomEvent(
    userId: string,
    contactId: string,
    eventData: any,
  ): Promise<void> {
    try {
      await this.knex('tbl_custom_events').insert({
        user_id: userId,
        contact_id: contactId,
        event_name: eventData.eventName,
        properties: JSON.stringify(eventData.properties || {}),
        event_at: this.knex.fn.now(),
        created_at: this.knex.fn.now(),
      });
    } catch (error) {
      // Non-fatal — log and continue
      this.logger.warn(
        `[TRIGGER-WORKER] Failed to record custom event "${eventData.eventName}" to history: ${error.message}`,
      );
    }
  }
}
