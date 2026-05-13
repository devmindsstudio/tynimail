import { Module } from '@nestjs/common';
import { PostmarkService } from './postmark.service';
import { PostmarkController } from './postmark.controller';
import { PostmarkWebhookService } from './postmark-webhook.service';
import { PostmarkWebhookController } from './postmark-webhook.controller';

@Module({
  controllers: [PostmarkController, PostmarkWebhookController],
  providers: [PostmarkService, PostmarkWebhookService],
  exports: [PostmarkService, PostmarkWebhookService],
})
export class PostmarkModule {}
