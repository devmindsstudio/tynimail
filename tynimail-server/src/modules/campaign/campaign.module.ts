import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { CampaignController } from "./campaign.controller";
import { CampaignService } from "./campaign.service";
import { CampaignAudienceService } from "./campaign-audience.service";
import { CampaignQueueProducer } from "@/modules/queues/producers/campaign-queue.producer";

@Module({
    imports: [
        BullModule.registerQueue({ name: 'campaign-queue' }),
    ],
    controllers: [CampaignController],
    providers: [CampaignService, CampaignAudienceService, CampaignQueueProducer],
    exports: [CampaignService, CampaignAudienceService],
})
export class CampaignModule {}