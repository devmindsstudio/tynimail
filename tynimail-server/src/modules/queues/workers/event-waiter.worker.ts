import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Knex } from 'knex';
import { FilterEvaluationService } from '@/modules/triggers/services/filter-evaluation.service';

@Processor('event-waiter-queue', { concurrency: 5 })
export class EventWaiterWorker extends WorkerHost {
  private readonly logger = new Logger(EventWaiterWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private filterEvaluationService: FilterEvaluationService,
    @InjectQueue('execution-queue') private executionQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { eventType, userId, contactId, eventData } = job.data;

    this.logger.log(
      `[WAITER-WORKER] Checking waiters for event="${eventType}" contact=${contactId}`,
    );

    const waiters = await this.knex('tbl_event_waiters')
      .where({
        user_id: userId,
        contact_id: contactId,
        event_type: eventType,
        resolved: false,
      })
      .where('expires_at', '>', this.knex.fn.now())
      .select('*');

    if (waiters.length === 0) {
      this.logger.debug(
        `[WAITER-WORKER] No active waiters for event="${eventType}" contact=${contactId}`,
      );
      return;
    }

    this.logger.log(
      `[WAITER-WORKER] Found ${waiters.length} waiter(s) to evaluate`,
    );

    for (const waiter of waiters) {
      try {
        const eventConfig =
          typeof waiter.event_config === 'string'
            ? JSON.parse(waiter.event_config)
            : waiter.event_config;

        if (eventConfig?.filters) {
          const matches = this.filterEvaluationService.evaluateFilters(
            eventConfig.filters,
            eventData,
          );

          if (!matches) {
            this.logger.debug(
              `[WAITER-WORKER] Event data does not match waiter ${waiter.id} filters`,
            );
            continue;
          }
        }

        // Event matched — resolve the waiter
        await this.knex('tbl_event_waiters')
          .where({ id: waiter.id })
          .update({
            resolved: true,
            resolved_at: this.knex.fn.now(),
            resolution_type: 'event_matched',
            resolution_data: JSON.stringify(eventData),
            updated_at: this.knex.fn.now(),
          });

        // Cancel the timeout job in BullMQ (remove from execution-queue)
        if (waiter.timeout_job_id) {
          try {
            const timeoutJob = await this.executionQueue.getJob(
              waiter.timeout_job_id,
            );
            if (timeoutJob) {
              await timeoutJob.remove();
              this.logger.log(
                `[WAITER-WORKER] Cancelled timeout job ${waiter.timeout_job_id} for waiter ${waiter.id}`,
              );
            }
          } catch (cancelError) {
            // Non-fatal — if timeout already fired, ExecutionWorker's race guard will catch it
            this.logger.warn(
              `[WAITER-WORKER] Could not cancel timeout job ${waiter.timeout_job_id}: ${cancelError.message}`,
            );
          }
        }

        // Enqueue immediate resume on 'yes' branch
        await this.executionQueue.add(
          'run-execution',
          {
            executionId: waiter.execution_id,
            workflowId: waiter.workflow_id,
            contactId: waiter.contact_id,
            userId: waiter.user_id,
            startFromNodeId: waiter.node_id,
            resumeBranch: 'yes',
          },
          {
            attempts: 1,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 500 },
          },
        );

        this.logger.log(
          `[WAITER-WORKER] Waiter ${waiter.id} resolved — execution ${waiter.execution_id} will resume on 'yes' branch`,
        );
      } catch (error) {
        this.logger.error(
          `[WAITER-WORKER] Error resolving waiter ${waiter.id}: ${error.message}`,
          error.stack,
        );
        // Continue to next waiter
      }
    }
  }
}
