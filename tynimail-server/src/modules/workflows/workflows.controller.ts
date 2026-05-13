import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@/guards';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new workflow',
    description: 'Create a new automation workflow',
  })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createWorkflowDto: CreateWorkflowDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.create(createWorkflowDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all workflows',
    description: 'Retrieve all workflows for the authenticated user',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'active', 'paused', 'archived'],
    description: 'Filter by workflow status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search workflows by name',
  })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const filters = {
      status: query.status,
      search: query.search,
    };
    return this.workflowsService.findAll(userId, filters);
  }

  @Get('manual-entry-enabled')
  @ApiOperation({
    summary: 'List workflows with manual_entry trigger',
    description:
      'Returns all active workflows that have a manual_entry trigger, for use in the manual entry UI',
  })
  @ApiResponse({ status: 200, description: 'List of manual-entry workflows' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findManualEntryEnabled(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.findManualEntryEnabled(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workflow by ID',
    description: 'Retrieve a single workflow by its ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow found' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update workflow',
    description: 'Update an existing workflow',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.update(id, updateWorkflowDto, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete workflow',
    description: 'Delete a workflow (only if not active)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete active workflow' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    await this.workflowsService.remove(id, userId);
    return { message: 'Workflow deleted successfully' };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Change workflow status',
    description: 'Unified endpoint to activate, pause, or archive a workflow',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'paused' | 'archived' },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (body.status === 'active') return this.workflowsService.activate(id, userId);
    if (body.status === 'paused') return this.workflowsService.pause(id, userId);
    if (body.status === 'archived') return this.workflowsService.archive(id, userId);
    throw new BadRequestException(`Invalid status value: ${body.status}. Use active, paused, or archived.`);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate workflow',
    description: 'Activate a workflow to start processing triggers',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow activated successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({
    status: 400,
    description: 'Workflow must have flow data and triggers',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activate(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.activate(id, userId);
  }

  @Patch(':id/pause')
  @ApiOperation({
    summary: 'Pause workflow',
    description: 'Pause an active workflow',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow paused successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async pause(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.pause(id, userId);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive workflow',
    description: 'Archive a workflow (soft delete)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow archived successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async archive(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.archive(id, userId);
  }

  @Get(':id/executions')
  @ApiOperation({
    summary: 'List executions for a workflow',
    description: 'Returns paginated execution history for a workflow',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiQuery({ name: 'status', required: false, enum: ['running', 'waiting', 'waiting_for_event', 'completed', 'failed', 'cancelled'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Execution list' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExecutions(
    @Param('id') id: string,
    @Query() query: any,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.getExecutions(id, userId, {
      status: query.status,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    });
  }

  @Get('executions/:executionId')
  @ApiOperation({
    summary: 'Get execution detail with step logs',
    description: 'Returns a single execution with all its step logs',
  })
  @ApiParam({ name: 'executionId', type: String, description: 'Execution ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Execution detail' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExecution(@Param('executionId') executionId: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.getExecution(executionId, userId);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get workflow statistics',
    description: 'Get execution statistics for a workflow',
  })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Workflow statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    return this.workflowsService.getStats(id, userId);
  }
}
