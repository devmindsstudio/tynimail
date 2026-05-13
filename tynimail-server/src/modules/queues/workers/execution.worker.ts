import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Knex } from 'knex';
import { ExecutionEngineService } from '@/modules/execution/services/execution-engine.service';

@Processor('execution-queue', { concurrency: 10 })
export class ExecutionWorker extends WorkerHost {
  private readonly logger = new Logger(ExecutionWorker.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private executionEngine: ExecutionEngineService,
    @InjectQueue('execution-queue') private executionQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const {
      executionId,
      workflowId,
      contactId,
      userId,
      startFromNodeId,
      resumeBranch,
      triggerData,
    } = job.data;

    this.logger.log(
      `[EXEC-WORKER] Processing execution ${executionId} (jobId=${job.id})`,
    );

    try {
      // Idempotency check — skip if already in a terminal state
      const execution = await this.knex('tbl_workflow_executions')
        .where({ id: executionId })
        .first();

      if (!execution) {
        this.logger.warn(
          `[EXEC-WORKER] Execution ${executionId} not found — skipping`,
        );
        return;
      }

      if (
        execution.status === 'completed' ||
        execution.status === 'failed' ||
        execution.status === 'cancelled'
      ) {
        this.logger.log(
          `[EXEC-WORKER] Execution ${executionId} already ${execution.status} — skipping (duplicate job delivery)`,
        );
        return;
      }

      // Timeout race condition guard (Steps 5.5 + 5.5b):
      // If this is a timeout job (resumeBranch === 'no'), check whether the event already
      // resolved the waiter. If so, abort — the 'yes' branch job was already enqueued.
      if (resumeBranch === 'no' && startFromNodeId) {
        const waiter = await this.knex('tbl_event_waiters')
          .where({
            execution_id: executionId,
            node_id: startFromNodeId,
          })
          .first();

        if (waiter?.resolved && waiter.resolution_type === 'event_matched') {
          this.logger.log(
            `[EXEC-WORKER] Timeout job for execution ${executionId} node ${startFromNodeId} — waiter already resolved by event, skipping 'no' branch`,
          );
          return;
        }

        // Mark the waiter as timed out (replaces the removed processEventWaiterTimeouts cron)
        if (waiter && !waiter.resolved) {
          await this.knex('tbl_event_waiters')
            .where({ id: waiter.id })
            .update({
              resolved: true,
              resolution_type: 'timeout',
              resolved_at: this.knex.fn.now(),
              updated_at: this.knex.fn.now(),
            });
          this.logger.log(
            `[EXEC-WORKER] Marked waiter ${waiter.id} as timed out — resuming 'no' branch for execution ${executionId}`,
          );
        }
      }

      // Determine start position:
      // - If startFromNodeId provided (resume path) — use it + resumeBranch
      // - Else if current_node_id set in DB (job retry mid-walk) — resume from there
      // - Else start fresh
      const result = await this.executionEngine.executeWorkflow({
        executionId,
        workflowId,
        contactId,
        userId,
        triggerData,
        resumeFromNodeId: startFromNodeId ?? undefined,
        resumeBranch: resumeBranch ?? undefined,
        startFromCurrentNode: !startFromNodeId && !!execution.current_node_id,
      });

      // Act on the result
      if (result.status === 'delayed') {
        this.logger.log(
          `[EXEC-WORKER] Execution ${executionId} delayed by ${result.delayMs}ms`,
        );
        await this.executionQueue.add(
          'run-execution',
          {
            executionId,
            workflowId,
            contactId,
            userId,
            startFromNodeId: result.resumeNodeId,
            resumeBranch: 'default',
            triggerData,
          },
          {
            delay: result.delayMs,
            attempts: 1,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 500 },
          },
        );
      }

      if (result.status === 'waiting_for_event') {
        this.logger.log(
          `[EXEC-WORKER] Execution ${executionId} waiting for event "${result.waitConfig.eventType}"`,
        );

        // Enqueue timeout job and store the BullMQ job ID for later cancellation
        const timeoutJob = await this.executionQueue.add(
          'run-execution',
          {
            executionId,
            workflowId,
            contactId,
            userId,
            startFromNodeId: result.nodeId,
            resumeBranch: 'no', // Timeout branch
            triggerData,
          },
          {
            delay: result.timeoutMs,
            attempts: 1,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 500 },
          },
        );

        // Store BullMQ job ID so EventWaiterWorker (Phase 5) can cancel it when the event fires
        await this.knex('tbl_event_waiters')
          .where({
            execution_id: executionId,
            node_id: result.nodeId,
            resolved: false,
          })
          .update({
            timeout_job_id: timeoutJob.id,
            updated_at: this.knex.fn.now(),
          });
      }

      if (result.status === 'failed') {
        this.logger.error(
          `[EXEC-WORKER] Execution ${executionId} failed: ${result.error}`,
        );
        // DB already updated by ExecutionEngineService
      }
    } catch (error) {
      this.logger.error(
        `[EXEC-WORKER] Unhandled error for execution ${executionId}: ${error.message}`,
        error.stack,
      );

      await this.knex('tbl_workflow_executions')
        .where({ id: executionId })
        .update({
          status: 'failed',
          error: error.message,
          completed_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        });

      await this.knex('tbl_workflows')
        .where({ id: workflowId })
        .decrement('active_executions', 1);
    }
  }
}
