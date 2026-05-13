import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Knex } from 'knex';
import { ExecutionQueueProducer } from '@/modules/queues/producers/execution-queue.producer';

@Injectable()
export class ExecutionSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(ExecutionSchedulerService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private executionQueueProducer: ExecutionQueueProducer,
  ) {}

  /**
   * One-time drain: migrate in-flight tbl_delayed_executions rows written by the
   * old cron-based engine into BullMQ execution-queue jobs.
   *
   * This can be removed after the first deploy confirms all rows are drained.
   */
  async onModuleInit() {
    this.logger.log(
      'Draining in-flight tbl_delayed_executions rows (one-time migration drain)...',
    );

    try {
      // Rows that are already due
      const pending = await this.knex('tbl_delayed_executions')
        .where({ status: 'pending' })
        .where('scheduled_for', '<=', this.knex.fn.now())
        .select('*');

      for (const row of pending) {
        await this.executionQueueProducer.enqueue({
          executionId: row.execution_id,
          workflowId: row.workflow_id,
          contactId: row.contact_id,
          userId: row.user_id,
          startFromNodeId: row.resume_from_node_id,
          resumeBranch: row.resume_branch,
        });

        await this.knex('tbl_delayed_executions')
          .where({ id: row.id })
          .update({
            status: 'completed',
            processed_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          });
      }

      // Future-dated pending rows — enqueue as delayed jobs
      const future = await this.knex('tbl_delayed_executions')
        .where({ status: 'pending' })
        .where('scheduled_for', '>', this.knex.fn.now())
        .select('*');

      for (const row of future) {
        const delayMs =
          new Date(row.scheduled_for).getTime() - Date.now();
        await this.executionQueueProducer.enqueueDelayed(
          {
            executionId: row.execution_id,
            workflowId: row.workflow_id,
            contactId: row.contact_id,
            userId: row.user_id,
            startFromNodeId: row.resume_from_node_id,
            resumeBranch: row.resume_branch,
          },
          delayMs,
        );

        await this.knex('tbl_delayed_executions')
          .where({ id: row.id })
          .update({
            status: 'completed',
            processed_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          });
      }

      this.logger.log(
        `Drain complete: ${pending.length} due, ${future.length} future rows migrated to BullMQ`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to drain tbl_delayed_executions: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Clean up old completed executions — runs daily at 2 AM.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldExecutions() {
    try {
      const retentionDays = 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedLogs = await this.knex('tbl_execution_logs')
        .whereIn('execution_id', function () {
          this.select('id')
            .from('tbl_workflow_executions')
            .where('status', 'completed')
            .where('completed_at', '<', cutoffDate);
        })
        .delete();

      const deletedExecutions = await this.knex('tbl_workflow_executions')
        .where('status', 'completed')
        .where('completed_at', '<', cutoffDate)
        .delete();

      const deletedDelayed = await this.knex('tbl_delayed_executions')
        .where('status', 'completed')
        .where('processed_at', '<', cutoffDate)
        .delete();

      this.logger.log(
        `Cleanup complete: ${deletedExecutions} executions, ${deletedLogs} logs, ${deletedDelayed} delayed executions`,
      );
    } catch (error) {
      this.logger.error(
        `Error cleaning up old executions: ${error.message}`,
        error.stack,
      );
    }
  }
}
