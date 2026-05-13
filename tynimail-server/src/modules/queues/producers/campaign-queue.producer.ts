import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface CampaignJobData {
  campaignId: string;
  userId: string;
  scheduledAt?: number | undefined; // in milliseconds
}

@Injectable()
export class CampaignQueueProducer {
  private readonly logger = new Logger(CampaignQueueProducer.name);

  constructor(@InjectQueue('campaign-queue') private queue: Queue) {}

  async enqueue(data: CampaignJobData): Promise<void> {
    // allowing the same function to work with running the campaign at a later date (scheduledAt) as specified by the customer.
    if (data.scheduledAt !== undefined) {
      await this.queue.add('run-campaign', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
        delay: data.scheduledAt,
      });
      this.logger.log(
        `[CAMPAIGN-PRODUCER] Scheduled campaign=${data.campaignId} for user=${data.userId} to run after ${data.scheduledAt} Milliseconds`,
      );
    } else {
      await this.queue.add('run-campaign', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      });
      this.logger.log(
        `[CAMPAIGN-PRODUCER] Running campaign=${data.campaignId} for user=${data.userId} on an immediate basis`,
      );
    }
  }
}
