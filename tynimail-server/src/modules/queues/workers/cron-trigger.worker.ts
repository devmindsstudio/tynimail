import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Knex } from 'knex';
import { FilterEvaluationService } from '@/modules/triggers/services/filter-evaluation.service';
import { CronTriggerJobData } from '@/modules/queues/producers/cron-trigger-queue.producer';
import { ExecutionJobData } from './trigger.worker';

const BATCH_SIZE = 500;

@Processor('cron-trigger-queue', { concurrency: 3 })
export class CronTriggerWorker extends WorkerHost {
  private readonly logger = new Logger(CronTriggerWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private filterEvaluationService: FilterEvaluationService,
    @InjectQueue('execution-queue') private executionQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<CronTriggerJobData>): Promise<void> {
    const { workflowId, userId, triggerSubtype, triggerConfig, triggerNodeId } =
      job.data;

    this.logger.log(
      `[CRON-WORKER] Processing ${triggerSubtype} for workflow "${workflowId}"`,
    );

    switch (triggerSubtype) {
      case 'anniversary':
        await this.processAnniversary(
          workflowId,
          userId,
          triggerConfig,
          triggerNodeId,
        );
        break;
      case 'contact_in_segment':
        await this.processContactInSegment(
          workflowId,
          userId,
          triggerConfig,
          triggerNodeId,
        );
        break;
      case 'contact_matches_filter':
        await this.processContactMatchesFilter(
          workflowId,
          userId,
          triggerConfig,
          triggerNodeId,
        );
        break;
    }
  }

  // ─── Anniversary ───────────────────────────────────────────────────────────

  private async processAnniversary(
    workflowId: string,
    userId: string,
    config: any,
    triggerNodeId: string,
  ): Promise<void> {
    const { timing, offset, filters } = config;
    // Normalise to lowercase — defensive against UI sending "BIRTHDAY" vs "birthday"
    const dateAttribute = typeof config.dateAttribute === 'string'
      ? config.dateAttribute.toLowerCase()
      : config.dateAttribute;

    if (!dateAttribute) {
      this.logger.warn(
        `[CRON-WORKER] Anniversary trigger missing dateAttribute for workflow ${workflowId}`,
      );
      return;
    }

    // Calculate the target date (month+day) to match against
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const targetDate = new Date(today);

    if (timing === 'before' && offset?.value) {
      // "7 days before birthday" → match contacts whose birthday is offset.value days from now
      targetDate.setUTCDate(targetDate.getUTCDate() + offset.value);
    } else if (timing === 'after' && offset?.value) {
      // "1 day after birthday" → match contacts whose birthday was offset.value days ago
      targetDate.setUTCDate(targetDate.getUTCDate() - offset.value);
    }

    const targetMonth = targetDate.getUTCMonth() + 1; // 1-indexed
    const targetDay = targetDate.getUTCDate();

    // Safe cast: only process contacts with a valid ISO date in the attribute
    const result = await this.knex.raw(
      `SELECT id FROM tbl_subscribers
       WHERE user_id = ?
       AND row_status = 1
       AND metadata->'attributes'->>? IS NOT NULL
       AND (metadata->'attributes'->>?) ~ '^\\d{4}-\\d{2}-\\d{2}$'
       AND EXTRACT(MONTH FROM (metadata->'attributes'->>?)::date) = ?
       AND EXTRACT(DAY FROM (metadata->'attributes'->>?)::date) = ?`,
      [
        userId,
        dateAttribute,
        dateAttribute,
        dateAttribute,
        targetMonth,
        dateAttribute,
        targetDay,
      ],
    );

    const contactIds: string[] = result.rows.map((r: any) => r.id);

    this.logger.log(
      `[CRON-WORKER] Anniversary: found ${contactIds.length} contact(s) matching ${dateAttribute} month=${targetMonth} day=${targetDay}`,
    );

    for (const contactId of contactIds) {
      await this.evaluateAndEnqueue(
        workflowId,
        userId,
        contactId,
        triggerNodeId,
        filters,
        {
          event: 'anniversary',
          dateAttribute,
          timing: timing || 'same_day',
          targetDate: targetDate.toISOString(),
        },
      );
    }
  }

  // ─── Contact in Segment ───────────────────────────────────────────────────

  private async processContactInSegment(
    workflowId: string,
    userId: string,
    config: any,
    triggerNodeId: string,
  ): Promise<void> {
    const { segmentId } = config;

    if (!segmentId) {
      this.logger.warn(
        `[CRON-WORKER] contact_in_segment trigger missing segmentId for workflow ${workflowId}`,
      );
      return;
    }

    // Load segment — must belong to same user
    const segment = await this.knex('tbl_segments')
      .where({ id: segmentId, user_id: userId })
      .first();

    if (!segment) {
      this.logger.warn(
        `[CRON-WORKER] Segment ${segmentId} not found or not owned by user ${userId}`,
      );
      return;
    }

    const segmentFilters =
      typeof segment.filters === 'string'
        ? JSON.parse(segment.filters)
        : segment.filters || { operator: 'AND', rules: [] };

    const hasFilterRules = segmentFilters?.rules?.length > 0;

    this.logger.log(
      `[CRON-WORKER] contact_in_segment: evaluating segment "${segment.name}" for workflow ${workflowId} (${hasFilterRules ? 'filter-based' : 'static list'})`,
    );

    if (!hasFilterRules) {
      // Static segment — query membership table directly
      const members = await this.knex('tbl_subscriber_segment')
        .where({ segment_id: segmentId })
        .join('tbl_subscribers', 'tbl_subscribers.id', 'tbl_subscriber_segment.subscriber_id')
        .where('tbl_subscribers.user_id', userId)
        .where('tbl_subscribers.row_status', 1)
        .select('tbl_subscriber_segment.subscriber_id as id');

      this.logger.log(
        `[CRON-WORKER] contact_in_segment: found ${members.length} member(s) in static segment`,
      );

      for (const member of members) {
        await this.evaluateAndEnqueue(workflowId, userId, member.id, triggerNodeId, null, {
          event: 'contact_in_segment',
          segmentId,
          segmentName: segment.name,
        });
      }
      return;
    }

    // Dynamic segment — delegate to contact_matches_filter using segment's filter rules
    await this.processContactMatchesFilter(
      workflowId,
      userId,
      { ...config, filters: segmentFilters },
      triggerNodeId,
      {
        event: 'contact_in_segment',
        segmentId,
        segmentName: segment.name,
      },
    );
  }

  // ─── Contact Matches Filter ───────────────────────────────────────────────

  private async processContactMatchesFilter(
    workflowId: string,
    userId: string,
    config: any,
    triggerNodeId: string,
    triggerDataOverride?: Record<string, any>,
  ): Promise<void> {
    const { filters } = config;

    if (!filters || !filters.rules || filters.rules.length === 0) {
      this.logger.warn(
        `[CRON-WORKER] contact_matches_filter has no filter rules for workflow ${workflowId} — skipping`,
      );
      return;
    }

    let offset = 0;
    let totalMatched = 0;

    while (true) {
      const contacts = await this.knex('tbl_subscribers')
        .where({ user_id: userId, row_status: 1 })
        .select('*')
        .limit(BATCH_SIZE)
        .offset(offset);

      if (contacts.length === 0) break;
      offset += contacts.length;

      for (const contact of contacts) {
        const contactData = {
          ...contact,
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email,
          attributes: contact.metadata?.attributes || {},
        };

        const passes = this.filterEvaluationService.evaluateFilters(
          filters,
          contactData,
        );
        if (!passes) continue;

        const triggerData = triggerDataOverride || {
          event: 'contact_matches_filter',
          matchedAt: new Date().toISOString(),
        };

        const enqueued = await this.evaluateAndEnqueue(
          workflowId,
          userId,
          contact.id,
          triggerNodeId,
          null,
          triggerData,
        );

        if (enqueued) totalMatched++;
      }

      if (contacts.length < BATCH_SIZE) break;
    }

    this.logger.log(
      `[CRON-WORKER] contact_matches_filter: ${totalMatched} contact(s) entered workflow ${workflowId}`,
    );
  }

  // ─── Shared: allow_reentry check + execution creation ────────────────────

  /**
   * Checks allow_reentry, optionally evaluates extra contact filters,
   * creates execution record and enqueues to execution-queue.
   * Returns true if execution was created.
   */
  private async evaluateAndEnqueue(
    workflowId: string,
    userId: string,
    contactId: string,
    triggerNodeId: string,
    extraFilters: any,
    triggerData: Record<string, any>,
  ): Promise<boolean> {
    const workflow = await this.knex('tbl_workflows')
      .where({ id: workflowId })
      .select('allow_reentry')
      .first();

    if (!workflow) return false;

    if (!workflow.allow_reentry) {
      const hasActive = await this.knex('tbl_workflow_executions')
        .where({ workflow_id: workflowId, contact_id: contactId })
        .whereIn('status', ['running', 'waiting', 'waiting_for_event'])
        .first();
      if (hasActive) return false;
    }

    // Evaluate optional per-contact filters (used by anniversary)
    if (extraFilters?.rules?.length > 0) {
      const contact = await this.knex('tbl_subscribers')
        .where({ id: contactId, user_id: userId })
        .first();
      if (!contact) return false;

      const contactData = {
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name,
        attributes: contact.metadata?.attributes || {},
      };

      const passes = this.filterEvaluationService.evaluateFilters(
        extraFilters,
        contactData,
      );
      if (!passes) return false;
    }

    // Create execution record
    const [execution] = await this.knex('tbl_workflow_executions')
      .insert({
        user_id: userId,
        workflow_id: workflowId,
        contact_id: contactId,
        status: 'running',
        trigger_node_id: triggerNodeId ?? null,
        trigger_data: JSON.stringify(triggerData),
        context: JSON.stringify({}),
        started_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('id');

    await this.knex('tbl_workflows')
      .where({ id: workflowId })
      .increment('total_executions', 1)
      .increment('active_executions', 1);

    await this.executionQueue.add(
      'run-execution',
      {
        executionId: execution.id,
        workflowId,
        contactId,
        userId,
        startFromNodeId: null,
        triggerData,
      } satisfies ExecutionJobData,
      {
        attempts: 1,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      },
    );

    this.logger.log(
      `[CRON-WORKER] Execution ${execution.id} created for contact ${contactId} in workflow ${workflowId}`,
    );

    return true;
  }
}
