import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

/**
 * Testing Controller
 *
 * Provides endpoints to simulate events for testing workflow triggers.
 * These endpoints emit events that TriggerListenerService listens to,
 * allowing you to test workflows without waiting for real events.
 *
 * ⚠️ This controller should be disabled in production!
 */
@ApiTags('Testing (Development Only)')
@Controller('testing')
export class TestingController {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject('KNEX_CONNECTION') private knex: Knex,
  ) {}

  /**
   * Simulate: Contact Added to List
   * Triggers workflows with "contact_added_to_list" trigger
   */
  @Post('events/contact-added-to-list')
  @ApiOperation({ summary: 'Simulate contact added to list event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'listId'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        listId: { type: 'string', format: 'uuid' },
      },
    },
  })
  async triggerContactAddedToList(@Body() body: {
    userId: string;
    contactId: string;
    listId: string;
  }) {
    this.eventEmitter.emit('contact.added_to_list', {
      userId: body.userId,
      contactId: body.contactId,
      listId: body.listId,
      source: 'test',
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      event: 'contact.added_to_list',
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Simulate: Contact Removed from List
   */
  @Post('events/contact-removed-from-list')
  @ApiOperation({ summary: 'Simulate contact removed from list event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'listId'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        listId: { type: 'string', format: 'uuid' },
      },
    },
  })
  async triggerContactRemovedFromList(@Body() body: {
    userId: string;
    contactId: string;
    listId: string;
  }) {
    this.eventEmitter.emit('contact.removed_from_list', {
      userId: body.userId,
      contactId: body.contactId,
      listId: body.listId,
      source: 'test',
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      event: 'contact.removed_from_list',
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Simulate: Email Opened
   */
  @Post('events/email-opened')
  @ApiOperation({ summary: 'Simulate email opened event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'emailId'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        emailId: { type: 'string', format: 'uuid' },
        campaignId: { type: 'string', format: 'uuid', nullable: true },
        workflowId: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  async triggerEmailOpened(@Body() body: {
    userId: string;
    contactId: string;
    emailId: string;
    campaignId?: string;
    workflowId?: string;
  }) {
    this.eventEmitter.emit('email.opened', {
      userId: body.userId,
      contactId: body.contactId,
      emailId: body.emailId,
      campaignId: body.campaignId,
      workflowId: body.workflowId,
      timestamp: new Date().toISOString(),
      source: 'test',
    });

    return {
      success: true,
      event: 'email.opened',
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Simulate: Email Clicked
   */
  @Post('events/email-clicked')
  @ApiOperation({ summary: 'Simulate email clicked event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'emailId', 'url'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        emailId: { type: 'string', format: 'uuid' },
        url: { type: 'string' },
        campaignId: { type: 'string', format: 'uuid', nullable: true },
        workflowId: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  async triggerEmailClicked(@Body() body: {
    userId: string;
    contactId: string;
    emailId: string;
    url: string;
    campaignId?: string;
    workflowId?: string;
  }) {
    this.eventEmitter.emit('email.clicked', {
      userId: body.userId,
      contactId: body.contactId,
      emailId: body.emailId,
      url: body.url,
      campaignId: body.campaignId,
      workflowId: body.workflowId,
      timestamp: new Date().toISOString(),
      source: 'test',
    });

    return {
      success: true,
      event: 'email.clicked',
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Simulate: Form Submitted
   */
  @Post('events/form-submitted')
  @ApiOperation({ summary: 'Simulate form submitted event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'formId'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        formId: { type: 'string', format: 'uuid' },
        formData: { type: 'object' },
      },
    },
  })
  async triggerFormSubmitted(@Body() body: {
    userId: string;
    contactId: string;
    formId: string;
    formData?: Record<string, any>;
  }) {
    this.eventEmitter.emit('form.submitted', {
      userId: body.userId,
      contactId: body.contactId,
      formId: body.formId,
      formData: body.formData || {},
      timestamp: new Date().toISOString(),
      source: 'test',
    });

    return {
      success: true,
      event: 'form.submitted',
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Simulate: Custom Event
   */
  @Post('events/custom-event')
  @ApiOperation({ summary: 'Simulate custom event' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'contactId', 'eventName'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        contactId: { type: 'string', format: 'uuid' },
        eventName: { type: 'string', example: 'product_purchased' },
        properties: { type: 'object' },
      },
    },
  })
  async triggerCustomEvent(@Body() body: {
    userId: string;
    contactId: string;
    eventName: string;
    properties?: Record<string, any>;
  }) {
    this.eventEmitter.emit(`custom_event.${body.eventName}`, {
      userId: body.userId,
      contactId: body.contactId,
      eventName: body.eventName,
      properties: body.properties || {},
      timestamp: new Date().toISOString(),
      source: 'test',
    });

    return {
      success: true,
      event: `custom_event.${body.eventName}`,
      message: 'Event emitted - check for triggered workflows',
    };
  }

  /**
   * Get recent workflow executions for debugging
   */
  @Get('executions')
  @ApiOperation({ summary: 'Get recent workflow executions' })
  async getRecentExecutions(
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
  ) {
    const query = this.knex('tbl_workflow_executions')
      .select(
        'tbl_workflow_executions.*',
        'tbl_workflows.name as workflow_name',
        'tbl_subscribers.email as contact_email',
      )
      .leftJoin('tbl_workflows', 'tbl_workflow_executions.workflow_id', 'tbl_workflows.id')
      .leftJoin('tbl_subscribers', 'tbl_workflow_executions.contact_id', 'tbl_subscribers.id')
      .orderBy('tbl_workflow_executions.started_at', 'desc')
      .limit(limit || 20);

    if (userId) {
      query.where('tbl_workflow_executions.user_id', userId);
    }

    const executions = await query;

    return {
      success: true,
      count: executions.length,
      executions,
    };
  }

  /**
   * Get execution logs for a specific execution
   */
  @Get('executions/:executionId/logs')
  @ApiOperation({ summary: 'Get execution logs for debugging' })
  async getExecutionLogs(@Param('executionId') executionId: string) {
    const logs = await this.knex('tbl_execution_logs')
      .where({ execution_id: executionId })
      .orderBy('step_id', 'asc')
      .select('*');

    const execution = await this.knex('tbl_workflow_executions')
      .where({ id: executionId })
      .first();

    return {
      success: true,
      execution,
      logs,
      logCount: logs.length,
    };
  }

  /**
   * Get active workflows for a user
   */
  @Get('workflows/active')
  @ApiOperation({ summary: 'Get active workflows' })
  async getActiveWorkflows(@Query('userId') userId: string) {
    if (!userId) {
      return { success: false, error: 'userId query parameter required' };
    }

    const workflows = await this.knex('tbl_workflows')
      .where({ user_id: userId, status: 'active' })
      .select('*');

    return {
      success: true,
      count: workflows.length,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        status: w.status,
        triggers: w.triggers,
        total_executions: w.total_executions,
        active_executions: w.active_executions,
        created_at: w.created_at,
      })),
    };
  }

  /**
   * Clear all test executions (cleanup)
   */
  @Post('cleanup/executions')
  @ApiOperation({ summary: 'Delete all workflow executions (for testing cleanup)' })
  async cleanupExecutions(@Body() body: { userId: string }) {
    if (!body.userId) {
      return { success: false, error: 'userId required in body' };
    }

    // Delete execution logs first (foreign key constraint)
    const deletedLogs = await this.knex('tbl_execution_logs')
      .whereIn('execution_id', function() {
        this.select('id')
          .from('tbl_workflow_executions')
          .where('user_id', body.userId);
      })
      .delete();

    // Delete executions
    const deletedExecutions = await this.knex('tbl_workflow_executions')
      .where({ user_id: body.userId })
      .delete();

    // Reset workflow counters
    await this.knex('tbl_workflows')
      .where({ user_id: body.userId })
      .update({
        total_executions: 0,
        active_executions: 0,
      });

    return {
      success: true,
      deleted: {
        executions: deletedExecutions,
        logs: deletedLogs,
      },
      message: 'All test executions cleared',
    };
  }

  /**
   * Health check for testing endpoints
   */
  @Get('health')
  @ApiOperation({ summary: 'Check if testing endpoints are available' })
  async health() {
    return {
      success: true,
      message: 'Testing endpoints are active',
      availableEvents: [
        'contact.added_to_list',
        'contact.removed_from_list',
        'email.opened',
        'email.clicked',
        'form.submitted',
        'custom_event.*',
      ],
    };
  }
}
