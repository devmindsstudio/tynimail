import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { PageViewService } from './page-view.service';
import { TrackEventService } from './track-event.service';
import { IdentifyService } from './identify.service';
import { ClickProcessingService } from './click-processing.service';

@Module({
  controllers: [TrackingController],
  providers: [PageViewService, TrackEventService, IdentifyService, ClickProcessingService],
  exports: [PageViewService, TrackEventService, IdentifyService, ClickProcessingService],
})
export class TrackingModule {}
