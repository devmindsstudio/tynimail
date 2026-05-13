import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostmarkWebhookService } from './postmark-webhook.service';

@ApiTags('Postmark')
@Controller('postmark/webhook')
export class PostmarkWebhookController {
  private readonly logger = new Logger(PostmarkWebhookController.name);

  constructor(
    private readonly webhookService: PostmarkWebhookService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Postmark webhook endpoint',
    description: 'Receives email events from Postmark (opens, clicks, bounces, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook payload',
  })
  async handleWebhook(@Body() payload: any) {
    this.logger.log(`📨 Postmark webhook received: ${payload.RecordType}`);

    try {
      await this.webhookService.processWebhook(payload);
      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Webhook processing failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
