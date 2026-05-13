import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FiltersModule } from '@/modules/filters/filters.module';
import { ExecutionModule } from '@/modules/execution/execution.module';
import { PostmarkModule } from '@/modules/postmark/postmark.module';
import { TriggerQueueProducer } from './producers/trigger-queue.producer';
import { ExecutionQueueProducer } from './producers/execution-queue.producer';
import { EventWaiterQueueProducer } from './producers/event-waiter-queue.producer';
import { CronTriggerQueueProducer } from './producers/cron-trigger-queue.producer';
import { CampaignEmailQueueProducer } from './producers/campaign-email-queue.producer';
import { TriggerWorker } from './workers/trigger.worker';
import { ExecutionWorker } from './workers/execution.worker';
import { EventWaiterWorker } from './workers/event-waiter.worker';
import { CronTriggerWorker } from './workers/cron-trigger.worker';
import { CampaignWorker } from './workers/campaign.worker';
import { CampaignEmailWorker } from './workers/campaign-email.worker';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'trigger-queue' },
      { name: 'execution-queue' },
      { name: 'event-waiter-queue' },
      { name: 'cron-trigger-queue' },
      { name: 'campaign-queue' },
      { name: 'campaign-email-queue' },
      { name: 'campaign-schedule-queue' },
    ),
    FiltersModule,
    forwardRef(() => ExecutionModule),
    PostmarkModule,
  ],
  providers: [
    TriggerQueueProducer,
    ExecutionQueueProducer,
    EventWaiterQueueProducer,
    CronTriggerQueueProducer,
    CampaignEmailQueueProducer,
    TriggerWorker,
    ExecutionWorker,
    EventWaiterWorker,
    CronTriggerWorker,
    CampaignWorker,
    CampaignEmailWorker,
  ],
  exports: [
    BullModule,
    TriggerQueueProducer,
    ExecutionQueueProducer,
    EventWaiterQueueProducer,
    CronTriggerQueueProducer,
    CampaignEmailQueueProducer,
  ],
})
export class QueuesModule {}
