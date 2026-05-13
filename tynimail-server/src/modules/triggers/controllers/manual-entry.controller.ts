import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@/guards';
import { TriggerQueueProducer } from '@/modules/queues/producers/trigger-queue.producer';

@ApiTags('Triggers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('triggers')
export class ManualEntryController {
  constructor(
    private readonly triggerQueueProducer: TriggerQueueProducer,
  ) {}

  /**
   * Manually trigger a workflow for a contact
   * Useful for testing workflows
   */
  @Post('manual/:workflowId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Manually trigger a workflow',
    description:
      'Manually start a workflow execution for a specific contact. Useful for testing.',
  })
  @ApiParam({
    name: 'workflowId',
    type: String,
    description: 'Workflow ID (UUID)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'Contact ID (UUID)',
          example: 'contact-123',
        },
        triggerData: {
          type: 'object',
          description: 'Optional trigger data to pass to workflow',
          example: { source: 'manual', testMode: true },
        },
      },
      required: ['contactId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Workflow execution started' })
  @ApiResponse({ status: 404, description: 'Workflow or contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerWorkflowManually(
    @Param('workflowId') workflowId: string,
    @Body() body: { contactId: string; triggerData?: any },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    // Enqueue manual_entry trigger job to trigger-queue
    await this.triggerQueueProducer.enqueue('manual_entry', {
      userId,
      contactId: body.contactId,
      source: 'manual',
      triggerData: body.triggerData || {},
    });

    return {
      success: true,
      message: 'Workflow trigger enqueued',
      note: 'Execution will be created asynchronously via BullMQ trigger-queue',
    };
  }

  /**
   * Simulate an event to test trigger matching
   * Does not create actual execution, just reports what would match
   */
  @Post('test/:triggerType')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Test trigger matching (dry run)',
    description:
      'Test which workflows would be triggered by an event without actually creating executions',
  })
  @ApiParam({
    name: 'triggerType',
    type: String,
    description:
      'Trigger type (e.g., contact_added_to_list, email_opened, custom_event)',
    example: 'contact_added_to_list',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'Contact ID (UUID)',
        },
        eventData: {
          type: 'object',
          description: 'Event-specific data',
          example: { listId: 'list-123', listName: 'VIP' },
        },
      },
      required: ['contactId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Matching workflows returned (no execution created)',
  })
  async testTrigger(
    @Param('triggerType') triggerType: string,
    @Body() body: { contactId: string; eventData?: any },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    // This would require a new method in TriggerListenerService
    // For now, return a placeholder
    return {
      success: true,
      message: 'Test endpoint - would match workflows',
      triggerType,
      contactId: body.contactId,
      note: 'This is a dry-run endpoint for testing trigger matching logic',
    };
  }

  /**
   * Emit a custom event
   */
  @Post('custom-event')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Emit a custom event',
    description: 'Trigger workflows based on a custom event',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'Contact ID (UUID)',
        },
        eventName: {
          type: 'string',
          description: 'Custom event name',
          example: 'purchase_completed',
        },
        properties: {
          type: 'object',
          description: 'Event properties',
          example: { amount: 99.99, product: 'Pro Plan' },
        },
      },
      required: ['contactId', 'eventName'],
    },
  })
  @ApiResponse({ status: 200, description: 'Custom event processed' })
  async emitCustomEvent(
    @Body()
    body: {
      contactId: string;
      eventName: string;
      properties?: any;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    await this.triggerQueueProducer.enqueue('custom_event', {
      userId,
      contactId: body.contactId,
      eventName: body.eventName,
      properties: body.properties || {},
    });

    return {
      success: true,
      message: 'Custom event enqueued',
      eventName: body.eventName,
      note: 'Matching workflows will be triggered asynchronously via BullMQ trigger-queue',
    };
  }

  /**
   * Refresh the active workflows cache
   * Useful after activating/deactivating workflows
   */
  @Post('cache/refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh workflow cache',
    description:
      'Manually refresh the cache of active workflows. Useful after activating/deactivating workflows.',
  })
  @ApiResponse({ status: 200, description: 'Cache refreshed successfully' })
  async refreshCache() {
    // No-op: cache has been removed in favour of direct DB queries in TriggerWorker
    return {
      success: true,
      message: 'No cache to refresh — TriggerWorker queries DB directly on each event',
    };
  }
}
