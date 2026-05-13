import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { TABLES, WORKFLOW_STATUS } from '@/constants';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';
import { IWorkflow, ITriggerConfig } from './interfaces';

@Injectable()
export class WorkflowsService {
    private readonly logger = new Logger(WorkflowsService.name);

    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

    /**
     * Create a new workflow
     */
    async create(createWorkflowDto: CreateWorkflowDto, userId: string): Promise<IWorkflow> {
        const workflowData = {
            user_id: userId,
            name: createWorkflowDto.name,
            description: createWorkflowDto.description || null,
            status: WORKFLOW_STATUS.DRAFT,
            flow_data: createWorkflowDto.flow_data ? JSON.stringify(createWorkflowDto.flow_data) : null,
            triggers: createWorkflowDto.triggers ? JSON.stringify(createWorkflowDto.triggers) : null,
            allow_reentry: createWorkflowDto.allow_reentry ?? false,
            exit_on_error: createWorkflowDto.exit_on_error ?? false,
            total_executions: 0,
            active_executions: 0,
        };

        const [workflow] = await this.knex(TABLES.WORKFLOWS)
            .insert(workflowData)
            .returning('*');

        return this.formatWorkflow(workflow);
    }

    /**
     * Find all workflows for a user
     */
    async findAll(
        userId: string,
        filters?: { status?: string; search?: string }
    ): Promise<IWorkflow[]> {
        let query = this.knex(TABLES.WORKFLOWS)
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');

        // Filter by status
        if (filters?.status) {
            query = query.where({ status: filters.status });
        }

        // Search by name
        if (filters?.search) {
            query = query.where('name', 'ilike', `%${filters.search}%`);
        }

        const workflows = await query;
        return workflows.map(this.formatWorkflow);
    }

    /**
     * Find active workflows that have a manual_entry trigger
     */
    async findManualEntryEnabled(userId: string): Promise<Pick<IWorkflow, 'id' | 'name'>[]> {
        const workflows = await this.knex(TABLES.WORKFLOWS)
            .where({ user_id: userId, status: WORKFLOW_STATUS.ACTIVE })
            .whereRaw(
                `EXISTS (
                  SELECT 1 FROM jsonb_array_elements(triggers) AS t
                  WHERE (t->>'subtype') = 'manual_entry'
                )`,
            )
            .select('id', 'name')
            .orderBy('name', 'asc');

        return workflows;
    }

    /**
     * Find one workflow by ID
     */
    async findOne(id: string, userId: string): Promise<IWorkflow> {
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        return this.formatWorkflow(workflow);
    }

    /**
     * Update a workflow
     */
    async update(
        id: string,
        updateWorkflowDto: UpdateWorkflowDto,
        userId: string
    ): Promise<IWorkflow> {
        // Check if workflow exists
        const existingWorkflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!existingWorkflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        // Prepare update data
        const updateData: any = {
            updated_at: this.knex.fn.now(),
        };

        if (updateWorkflowDto.name !== undefined) {
            updateData.name = updateWorkflowDto.name;
        }

        if (updateWorkflowDto.description !== undefined) {
            updateData.description = updateWorkflowDto.description;
        }

        if (updateWorkflowDto.status !== undefined) {
            updateData.status = updateWorkflowDto.status;

            // Set activated_at when workflow is activated for the first time
            if (updateWorkflowDto.status === WORKFLOW_STATUS.ACTIVE && !existingWorkflow.activated_at) {
                updateData.activated_at = this.knex.fn.now();
            }
        }

        if (updateWorkflowDto.flow_data !== undefined) {
            updateData.flow_data = JSON.stringify(updateWorkflowDto.flow_data);
        }

        if (updateWorkflowDto.triggers !== undefined) {
            updateData.triggers = JSON.stringify(updateWorkflowDto.triggers);
        }

        if (updateWorkflowDto.allow_reentry !== undefined) {
            updateData.allow_reentry = updateWorkflowDto.allow_reentry;
        }

        if (updateWorkflowDto.exit_on_error !== undefined) {
            updateData.exit_on_error = updateWorkflowDto.exit_on_error;
        }

        const [updatedWorkflow] = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .update(updateData)
            .returning('*');

        return this.formatWorkflow(updatedWorkflow);
    }

    /**
     * Delete a workflow
     */
    async remove(id: string, userId: string): Promise<void> {
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        // Don't allow deleting active workflows
        if (workflow.status === WORKFLOW_STATUS.ACTIVE) {
            throw new BadRequestException('Cannot delete an active workflow. Please pause it first.');
        }

        await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .delete();
    }

    /**
     * Activate a workflow
     */
    async activate(id: string, userId: string): Promise<IWorkflow> {
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        // Validate workflow has flow_data and triggers
        if (!workflow.flow_data || !workflow.triggers) {
            throw new BadRequestException('Workflow must have flow data and triggers before activation');
        }

        const updateData: any = {
            status: WORKFLOW_STATUS.ACTIVE,
            updated_at: this.knex.fn.now(),
        };

        // Set activated_at if first time activating
        if (!workflow.activated_at) {
            updateData.activated_at = this.knex.fn.now();
        }

        const [updatedWorkflow] = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .update(updateData)
            .returning('*');

        this.logger.log(`[WORKFLOW] Activated workflow "${updatedWorkflow.name}" (id=${id}) — NOTE: trigger cache refresh may take up to 60s`);
        return this.formatWorkflow(updatedWorkflow);
    }

    /**
     * Pause a workflow
     */
    async pause(id: string, userId: string): Promise<IWorkflow> {
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        const [updatedWorkflow] = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .update({
                status: WORKFLOW_STATUS.PAUSED,
                updated_at: this.knex.fn.now(),
            })
            .returning('*');

        return this.formatWorkflow(updatedWorkflow);
    }

    /**
     * Archive a workflow
     */
    async archive(id: string, userId: string): Promise<IWorkflow> {
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .first();

        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${id} not found`);
        }

        const [updatedWorkflow] = await this.knex(TABLES.WORKFLOWS)
            .where({ id, user_id: userId })
            .update({
                status: WORKFLOW_STATUS.ARCHIVED,
                updated_at: this.knex.fn.now(),
            })
            .returning('*');

        return this.formatWorkflow(updatedWorkflow);
    }

    /**
     * Get workflow statistics
     */
    async getStats(id: string, userId: string): Promise<any> {
        const workflow = await this.findOne(id, userId);

        // Get execution statistics
        const stats = await this.knex(TABLES.WORKFLOW_EXECUTIONS)
            .where({ workflow_id: id, user_id: userId })
            .select([
                this.knex.raw('COUNT(*) as total_executions'),
                this.knex.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed_executions"),
                this.knex.raw("COUNT(*) FILTER (WHERE status = 'failed') as failed_executions"),
                this.knex.raw("COUNT(*) FILTER (WHERE status IN ('running', 'waiting', 'waiting_for_event')) as active_executions"),
                this.knex.raw(`
                    AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60)
                    FILTER (WHERE status = 'completed' AND completed_at IS NOT NULL) as average_duration_minutes
                `),
            ])
            .first();

        return {
            workflow,
            stats: {
                total_executions: parseInt(stats.total_executions) || 0,
                completed_executions: parseInt(stats.completed_executions) || 0,
                failed_executions: parseInt(stats.failed_executions) || 0,
                active_executions: parseInt(stats.active_executions) || 0,
                average_duration_minutes: parseFloat(stats.average_duration_minutes) || 0,
            },
        };
    }

    /**
     * List executions for a workflow (paginated)
     */
    async getExecutions(
        workflowId: string,
        userId: string,
        filters: { status?: string; page?: number; limit?: number },
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        // Verify workflow ownership
        const workflow = await this.knex(TABLES.WORKFLOWS)
            .where({ id: workflowId, user_id: userId })
            .first();
        if (!workflow) {
            throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
        }

        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 50, 200);
        const offset = (page - 1) * limit;

        let query = this.knex(TABLES.WORKFLOW_EXECUTIONS)
            .where(`${TABLES.WORKFLOW_EXECUTIONS}.workflow_id`, workflowId)
            .where(`${TABLES.WORKFLOW_EXECUTIONS}.user_id`, userId);

        if (filters.status) {
            query = query.where(`${TABLES.WORKFLOW_EXECUTIONS}.status`, filters.status);
        }

        const [{ count }] = await query.clone().count('* as count');
        const rows = await query
            .leftJoin('tbl_subscribers', 'tbl_subscribers.id', `${TABLES.WORKFLOW_EXECUTIONS}.contact_id`)
            .select([
                `${TABLES.WORKFLOW_EXECUTIONS}.id`,
                `${TABLES.WORKFLOW_EXECUTIONS}.workflow_id`,
                `${TABLES.WORKFLOW_EXECUTIONS}.contact_id`,
                `${TABLES.WORKFLOW_EXECUTIONS}.status`,
                `${TABLES.WORKFLOW_EXECUTIONS}.started_at`,
                `${TABLES.WORKFLOW_EXECUTIONS}.completed_at`,
                `${TABLES.WORKFLOW_EXECUTIONS}.current_node_id`,
                `${TABLES.WORKFLOW_EXECUTIONS}.error`,
                this.knex.raw('tbl_subscribers.email as contact_email'),
                this.knex.raw('tbl_subscribers.first_name as contact_first_name'),
                this.knex.raw('tbl_subscribers.last_name as contact_last_name'),
            ])
            .orderBy(`${TABLES.WORKFLOW_EXECUTIONS}.started_at`, 'desc')
            .limit(limit)
            .offset(offset);

        return { data: rows, total: Number(count), page, limit };
    }

    /**
     * Get a single execution with its step logs
     */
    async getExecution(executionId: string, userId: string): Promise<any> {
        const execution = await this.knex(TABLES.WORKFLOW_EXECUTIONS)
            .where({ id: executionId, user_id: userId })
            .first();

        if (!execution) {
            throw new NotFoundException(`Execution with ID ${executionId} not found`);
        }

        const logs = await this.knex('tbl_execution_logs')
            .where({ execution_id: executionId })
            .orderBy('executed_at', 'asc');

        const contact = await this.knex('tbl_subscribers')
            .where({ id: execution.contact_id })
            .select('id', 'email', 'first_name', 'last_name')
            .first();

        return { ...execution, logs, contact: contact ?? null };
    }

    /**
     * Format workflow (parse JSON fields)
     */
    private formatWorkflow(workflow: any): IWorkflow {
        const parseIfString = (val: any) => {
            if (!val) return null;
            if (typeof val === 'string') return JSON.parse(val);
            return val;
        };
        return {
            ...workflow,
            flow_data: parseIfString(workflow.flow_data),
            triggers: parseIfString(workflow.triggers),
        };
    }
}
