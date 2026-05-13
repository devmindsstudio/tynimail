import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface CronTriggerJobData {
  workflowId: string;
  userId: string;
  triggerSubtype: 'anniversary' | 'contact_in_segment' | 'contact_matches_filter';
  triggerConfig: Record<string, any>;
  triggerNodeId: string;
}

@Injectable()
export class CronTriggerQueueProducer {
  constructor(
    @InjectQueue('cron-trigger-queue') private readonly queue: Queue,
  ) {}

  async enqueue(data: CronTriggerJobData): Promise<void> {
    await this.queue.add('process-cron-trigger', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 200 },
    });
  }
}
