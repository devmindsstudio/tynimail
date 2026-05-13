import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EventWaiterJobData {
  eventType: string;
  userId: string;
  contactId: string;
  eventData: Record<string, any>;
}

@Injectable()
export class EventWaiterQueueProducer {
  constructor(@InjectQueue('event-waiter-queue') private queue: Queue) {}

  async enqueue(
    eventType: string,
    userId: string,
    contactId: string,
    eventData: Record<string, any>,
  ) {
    await this.queue.add(
      'resolve-waiters',
      { eventType, userId, contactId, eventData } satisfies EventWaiterJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      },
    );
  }
}
