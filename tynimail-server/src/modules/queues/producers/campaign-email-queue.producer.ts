import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface CampaignEmailJobData {
    campaignId: string;
    subscriberId: string;
    userId: string;
}

@Injectable()
export class CampaignEmailQueueProducer {
    constructor(@InjectQueue('campaign-email-queue') private queue: Queue) {}

    async enqueue(data: CampaignEmailJobData): Promise<void> {
        await this.queue.add('send-campaign-email', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: { count: 5000 },
            removeOnFail: { count: 1000 },
        });
    }

    async enqueueBulk(jobs: CampaignEmailJobData[]): Promise<void> {
        await this.queue.addBulk(
            jobs.map((data) => ({
                name: 'send-campaign-email',
                data,
                opts: {
                    attempts: 3,
                    backoff: { type: 'exponential' as const, delay: 3000 },
                    removeOnComplete: { count: 5000 },
                    removeOnFail: { count: 1000 },
                },
            })),
        );
    }
}
