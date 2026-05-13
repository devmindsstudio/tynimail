import { Module, forwardRef } from "@nestjs/common";
import { SubscriberService } from "./subscriber.service";
import { SubscriberController } from "./subscriber.controller";
import { SegmentModule } from "../segment";
import { CSVModule } from "../csv";

@Module({
    imports: [forwardRef(() => SegmentModule), CSVModule],
    controllers: [SubscriberController],
    providers: [SubscriberService],
    exports: [SubscriberService]
})
export class SubscriberModule { }