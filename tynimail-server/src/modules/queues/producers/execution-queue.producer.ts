import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { ExecutionJobData } from '../workers/trigger.worker'; // reuse interface

@Injectable()
export class ExecutionQueueProducer {
  constructor(@InjectQueue('execution-queue') private queue: Queue) {}

  async enqueue(data: ExecutionJobData, opts?: Partial<JobsOptions>) {
    await this.queue.add('run-execution', data, {
      attempts: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
      ...opts,
    });
  }

  async enqueueDelayed(data: ExecutionJobData, delayMs: number) {
    await this.queue.add('run-execution', data, {
      delay: delayMs,
      attempts: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    });
  }

  /**
   * Returns the BullMQ job ID — needed for timeout cancellation in Phase 5.
   */
  async enqueueDelayedWithId(
    data: ExecutionJobData,
    delayMs: number,
  ): Promise<string> {
    const job = await this.queue.add('run-execution', data, {
      delay: delayMs,
      attempts: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    });
    return job.id!;
  }
}
