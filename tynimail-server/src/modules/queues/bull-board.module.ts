import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'trigger-queue',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'execution-queue',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'event-waiter-queue',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'cron-trigger-queue',
      adapter: BullMQAdapter,
    }),
  ],
})
export class BullBoardConfigModule {}
