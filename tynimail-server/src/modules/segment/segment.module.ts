import { Module, forwardRef } from "@nestjs/common";
import { SegmentService } from "./segment.service";
import { SegmentController } from "./segment.controller";
import { SubscriberModule } from "../subscriber";

@Module(
    {
        imports: [forwardRef(() => SubscriberModule)],
        controllers: [SegmentController],
        providers: [SegmentService],
        exports: [SegmentService]
    }
)

export class SegmentModule { }