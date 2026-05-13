import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionEngineService } from './services/execution-engine.service';
import { ExecutionSchedulerService } from './services/execution-scheduler.service';
import { ActionsModule } from '@/modules/actions';
import { FiltersModule } from '@/modules/filters/filters.module';
import { ExecutionQueueProducer } from '@/modules/queues/producers/execution-queue.producer';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ActionsModule,
    // Use FiltersModule directly (not TriggersModule) to avoid circular:
    //   TriggersModule → QueuesModule → forwardRef(ExecutionModule) → TriggersModule
    FiltersModule,
    // Register execution-queue locally so ExecutionQueueProducer resolves
    // without importing QueuesModule (which would re-introduce the circular)
    BullModule.registerQueue({ name: 'execution-queue' }),
  ],
  providers: [
    ExecutionEngineService,
    ExecutionSchedulerService,
    ExecutionQueueProducer, // used by ExecutionSchedulerService (drain)
  ],
  exports: [ExecutionEngineService],
})
export class ExecutionModule {}
