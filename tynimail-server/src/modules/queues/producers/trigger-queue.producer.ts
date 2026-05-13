import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface TriggerJobData {
  triggerType: string;
  eventData: {
    userId: string;
    contactId: string;
    [key: string]: any;
  };
}

@Injectable()
export class TriggerQueueProducer {
  constructor(@InjectQueue('trigger-queue') private queue: Queue) {}

  async enqueue(
    triggerType: string,
    eventData: { userId: string; contactId: string; [key: string]: any },
  ) {
    await this.queue.add(
      'match-workflows',
      { triggerType, eventData } satisfies TriggerJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      },
    );
  }
}
