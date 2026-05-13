import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TriggerEventBridgeService } from './services/trigger-event-bridge.service';
import { FilterEvaluationService } from './services/filter-evaluation.service';
import { CronTriggerService } from './services/cron-trigger.service';
import { ManualEntryController } from './controllers/manual-entry.controller';
import { FiltersModule } from '@/modules/filters/filters.module';
import { QueuesModule } from '@/modules/queues/queues.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,  // KNEX_CONNECTION for TriggerEventBridgeService (unsubscribe handler)
    FiltersModule,   // FilterEvaluationService (no queue deps — no circular dep)
    QueuesModule,    // TriggerQueueProducer + CronTriggerQueueProducer
  ],
  controllers: [ManualEntryController],
  providers: [
    TriggerEventBridgeService,
    FilterEvaluationService,
    CronTriggerService,
  ],
  exports: [FilterEvaluationService],
})
export class TriggersModule {}
