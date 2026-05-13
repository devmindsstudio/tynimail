import { Injectable, Logger, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { ActionsService } from '@/modules/actions/actions.service';
import { FilterEvaluationService } from '@/modules/triggers/services/filter-evaluation.service';

interface FlowNode {
  id: string;
  type: string;
  data: {
    stepId?: number;
    subtype?: string;
    actionType?: string;
    label?: string;
    config?: Record<string, any>;
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface ExecutionContext {
  userId: string;
  executionId: string;
  workflowId: string;
  contactId: string;
  contact?: any;
  triggerData?: Record<string, any>;
  previousResults?: Record<string, any>;
}

export type ExecutionResult =
  | { status: 'completed' }
  | { status: 'failed'; error: string }
  | { status: 'delayed'; delayMs: number; resumeNodeId: string }
  | {
      status: 'waiting_for_event';
      nodeId: string;
      waitConfig: any;
      timeoutMs: number;
    };

@Injectable()
export class ExecutionEngineService {
  private readonly logger = new Logger(ExecutionEngineService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private actionsService: ActionsService,
    private filterEvaluationService: FilterEvaluationService,
  ) {
    this.logger.log('Execution Engine initialized');
  }

  /**
   * Execute the workflow by walking the DAG.
   * Called directly by ExecutionWorker.
   */
  async executeWorkflow(payload: {
    executionId: string;
    workflowId: string;
    userId: string;
    contactId: string;
    triggerData?: Record<string, any>;
    resumeFromNodeId?: string;
    resumeBranch?: string;
    startFromCurrentNode?: boolean; // true = load current_node_id from DB (job retry path)
  }): Promise<ExecutionResult> {
    const {
      executionId,
      workflowId,
      userId,
      contactId,
      triggerData,
      resumeFromNodeId,
      resumeBranch,
      startFromCurrentNode,
    } = payload;

    // 1. Load workflow
    const workflow = await this.knex('tbl_workflows')
      .where({ id: workflowId, user_id: userId })
      .first();

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    // 2. Load contact
    const contact = await this.knex('tbl_subscribers')
      .where({ id: contactId, user_id: userId })
      .first();

    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    // Prepare contact data with attributes
    const contactData = {
      ...contact,
      firstName: contact.first_name,
      lastName: contact.last_name,
      attributes: contact.metadata?.attributes || {},
    };

    // 3. Parse flow data
    const flowData: FlowData =
      typeof workflow.flow_data === 'string'
        ? JSON.parse(workflow.flow_data)
        : workflow.flow_data;

    // 4. Build adjacency map for DAG traversal
    const adjacencyMap = this.buildAdjacencyMap(flowData.edges);
    const nodeMap = new Map(flowData.nodes.map((n) => [n.id, n]));

    // 5. Initialize execution context
    const executionContext: Record<string, any> = {};

    // 6. Determine starting node
    let currentNodeId: string | null;

    if (resumeFromNodeId && resumeBranch) {
      // Resuming from a wait/delay node — use the branch target
      currentNodeId = this.getBranchTargetId(
        resumeFromNodeId,
        resumeBranch,
        flowData.edges,
      );

      // Load previous execution context
      const execution = await this.knex('tbl_workflow_executions')
        .where({ id: executionId })
        .first();

      if (execution?.execution_context) {
        Object.assign(
          executionContext,
          typeof execution.execution_context === 'string'
            ? JSON.parse(execution.execution_context)
            : execution.execution_context,
        );
      }
    } else if (startFromCurrentNode) {
      // Job retry mid-walk — resume from the node that was in progress
      const execution = await this.knex('tbl_workflow_executions')
        .where({ id: executionId })
        .first();

      currentNodeId = execution?.current_node_id ?? null;

      if (execution?.execution_context) {
        Object.assign(
          executionContext,
          typeof execution.execution_context === 'string'
            ? JSON.parse(execution.execution_context)
            : execution.execution_context,
        );
      }

      if (!currentNodeId) {
        // current_node_id not set — fall through to fresh start below
        const triggerNode = flowData.nodes.find(
          (n) => n.type === 'trigger' || n.data.subtype === 'trigger',
        );
        if (!triggerNode) throw new Error('No trigger node found in workflow');
        currentNodeId = this.getNextNodeId(triggerNode.id, adjacencyMap);
      }
    } else {
      // Starting fresh — find first node after trigger
      const triggerNode = flowData.nodes.find(
        (n) => n.type === 'trigger' || n.data.subtype === 'trigger',
      );

      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Log the trigger node as the first completed step
      await this.logExecutionStep(
        executionId,
        triggerNode,
        { success: true, data: triggerData || {} },
        userId,
      );

      currentNodeId = this.getNextNodeId(triggerNode.id, adjacencyMap);
    }

    // 7. Walk the DAG
    return this.walkDag(
      currentNodeId,
      {
        userId,
        executionId,
        workflowId,
        contactId,
        contact: contactData,
        triggerData: triggerData || {},
        previousResults: executionContext,
      },
      flowData,
      nodeMap,
      adjacencyMap,
      workflow.exit_on_error || false,
    );
  }

  /**
   * Walk the DAG and execute nodes.
   * Returns an ExecutionResult — the worker acts on paused states (delay/wait-for-event).
   */
  private async walkDag(
    startNodeId: string | null,
    context: ExecutionContext,
    flowData: FlowData,
    nodeMap: Map<string, FlowNode>,
    adjacencyMap: Map<string, FlowEdge[]>,
    exitOnError: boolean,
  ): Promise<ExecutionResult> {
    let currentNodeId = startNodeId;

    while (currentNodeId) {
      const node = nodeMap.get(currentNodeId);

      if (!node) {
        this.logger.warn(`Node ${currentNodeId} not found in workflow`);
        break;
      }

      // Idempotency check: skip nodes already completed (handles job retry mid-walk)
      const existingLog = await this.knex('tbl_execution_logs')
        .where({
          execution_id: context.executionId,
          node_id: node.id,
          status: 'completed',
        })
        .first();

      if (existingLog) {
        this.logger.log(
          `[ENGINE] ⏭ Node "${node.data.label || node.id}" already completed — skipping (idempotency)`,
        );
        // Repopulate context so downstream nodes referencing this node's output still work
        const previousData = existingLog.output_data
          ? typeof existingLog.output_data === 'string'
            ? JSON.parse(existingLog.output_data)
            : existingLog.output_data
          : {};
        context.previousResults![node.id] = previousData;

        // Advance using stored branch or linear flow
        if (existingLog.branch_taken) {
          currentNodeId = this.getBranchTargetId(
            node.id,
            existingLog.branch_taken,
            flowData.edges,
          );
        } else {
          currentNodeId = this.getNextNodeId(node.id, adjacencyMap);
        }
        continue;
      }

      // Update current position
      await this.knex('tbl_workflow_executions')
        .where({ id: context.executionId })
        .update({
          current_node_id: currentNodeId,
          updated_at: this.knex.fn.now(),
        });

      const nodeLabel = node.data.label || node.id;
      const nodeSubtype = node.data.subtype || node.type;
      this.logger.log(
        `[ENGINE] ▶ Node: "${nodeLabel}" | type=${nodeSubtype} | executionId=${context.executionId}`,
      );

      // Execute the node
      const result = await this.executeNode(node, context);

      // Log the execution step
      await this.logExecutionStep(
        context.executionId,
        node,
        result,
        context.userId,
      );

      // delete_contact signals the engine to stop — contact and execution row are gone
      if (result.contactDeleted === true) {
        this.logger.log(
          `[ENGINE] Contact deleted at node "${nodeLabel}" — terminating execution`,
        );
        return { status: 'completed' };
      }

      // Handle failure
      if (!result.success && !result.skipped) {
        this.logger.error(
          `[ENGINE] ✗ Node "${nodeLabel}" FAILED: ${result.error}`,
        );

        await this.knex('tbl_workflow_executions')
          .where({ id: context.executionId })
          .update({
            status: 'failed',
            error: result.error,
            error_node_id: node.id,
            completed_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          });

        await this.knex('tbl_workflows')
          .where({ id: context.workflowId })
          .decrement('active_executions', 1);

        if (exitOnError) {
          return { status: 'failed', error: `Node ${node.id} failed: ${result.error}` };
        } else {
          this.logger.warn(`Continuing despite error in node ${node.id}`);
        }
      }

      // Store result in context
      if (result.data) {
        context.previousResults![node.id] = result.data;
      }

      // Log success/skip
      if (result.success) {
        if (result.skipped) {
          this.logger.log(
            `[ENGINE]   ⤼ Node "${nodeLabel}" skipped: ${result.reason || 'no reason given'}`,
          );
        } else {
          this.logger.log(
            `[ENGINE]   ✓ Node "${nodeLabel}" succeeded${result.branch ? ` | branch=${result.branch}` : ''}`,
          );
        }
      }

      // Handle exit node
      if (node.type === 'exit' || node.data.subtype === 'exit') {
        this.logger.log(
          `[ENGINE] ■ Exit node reached — completing execution ${context.executionId}`,
        );
        await this.completeExecution(context.executionId, context.workflowId);
        return { status: 'completed' };
      }

      // Handle delay node — return to worker which re-enqueues with BullMQ delay
      if (node.data.subtype === 'delay' && result.delayUntil) {
        const delayMs = Math.max(
          0,
          new Date(result.delayUntil).getTime() - Date.now(),
        );
        this.logger.log(
          `[ENGINE] ⏸ Delay node — pausing execution ${context.executionId} for ${delayMs}ms`,
        );

        await this.knex('tbl_workflow_executions')
          .where({ id: context.executionId })
          .update({
            status: 'waiting',
            scheduled_resume_at: result.delayUntil,
            execution_context: JSON.stringify(context.previousResults || {}),
            updated_at: this.knex.fn.now(),
          });

        return {
          status: 'delayed',
          delayMs,
          resumeNodeId: node.id,
        };
      }

      // Handle wait-for-event node — return to worker which creates timeout job
      if (node.data.subtype === 'wait_for_event' && result.waitConfig) {
        const { eventType, eventConfig, waitTime } = result.waitConfig;
        const { months = 0, days = 7, hours = 0, minutes = 0 } =
          waitTime || {};
        const timeoutMs =
          months * 30 * 24 * 60 * 60 * 1000 +
          days * 24 * 60 * 60 * 1000 +
          hours * 60 * 60 * 1000 +
          minutes * 60 * 1000;
        const expiresAt = new Date(Date.now() + timeoutMs);

        this.logger.log(
          `[ENGINE] ⏸ Wait-for-event node — pausing execution ${context.executionId} waiting for event="${eventType}"`,
        );

        await this.knex('tbl_workflow_executions')
          .where({ id: context.executionId })
          .update({
            status: 'waiting_for_event',
            scheduled_resume_at: expiresAt,
            execution_context: JSON.stringify(context.previousResults || {}),
            updated_at: this.knex.fn.now(),
          });

        // Insert event waiter record (timeout_job_id filled by worker after enqueueing timeout job)
        await this.knex('tbl_event_waiters').insert({
          id: this.generateId(),
          execution_id: context.executionId,
          workflow_id: context.workflowId,
          user_id: context.userId,
          contact_id: context.contactId,
          node_id: node.id,
          event_type: eventType,
          event_config: JSON.stringify(eventConfig || {}),
          expires_at: expiresAt,
          resolved: false,
          timeout_job_id: null,
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        });

        return {
          status: 'waiting_for_event',
          nodeId: node.id,
          waitConfig: result.waitConfig,
          timeoutMs,
        };
      }

      // Determine next node
      if (result.branch) {
        // Branching node (conditional/percentage split)
        currentNodeId = this.getBranchTargetId(
          node.id,
          result.branch,
          flowData.edges,
        );

        if (!currentNodeId) {
          const outgoingEdges = flowData.edges.filter(e => e.source === node.id);
          this.logger.warn(
            `[ENGINE] No target found for branch "${result.branch}" from node "${nodeLabel}" (id=${node.id}). Outgoing edges: ${JSON.stringify(outgoingEdges.map(e => ({ target: e.target, sourceHandle: e.sourceHandle })))} — ending execution`,
          );
          await this.completeExecution(context.executionId, context.workflowId);
          return { status: 'completed' };
        }
        this.logger.log(
          `[ENGINE] → Branching to node ${currentNodeId} via branch="${result.branch}"`,
        );
      } else {
        // Linear flow
        currentNodeId = this.getNextNodeId(node.id, adjacencyMap);
        if (currentNodeId) {
          this.logger.log(`[ENGINE] → Next node: ${currentNodeId}`);
        }
      }
    }

    // Reached end of graph without explicit exit
    this.logger.log(
      `[ENGINE] ■ End of graph — completing execution ${context.executionId}`,
    );
    await this.completeExecution(context.executionId, context.workflowId);
    return { status: 'completed' };
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<any> {
    const subtype = node.data.subtype || node.data.actionType || node.type;
    const config = node.data.config || {};

    try {
      // Action nodes
      if (
        [
          'send_email',
          'add_to_list',
          'remove_from_list',
          'update_contact',
          'notify_email',
          'call_webhook',
          'blocklist_contact',
          'assign_user',
          'delete_contact',
        ].includes(subtype)
      ) {
        return await this.actionsService.executeAction(subtype, config, {
          userId: context.userId,
          contactId: context.contactId,
          executionId: context.executionId,
          workflowId: context.workflowId,
          nodeId: node.id,
          contact: context.contact,
          triggerData: context.triggerData,
          previousResults: context.previousResults,
        });
      }

      // Rule/control flow nodes
      switch (subtype) {
        case 'delay':
          return this.executeDelay(config);
        case 'conditional_split':
          return this.executeConditionalSplit(config, context);
        case 'percentage_split':
          return this.executePercentageSplit(config);
        case 'wait_for_event':
          return this.executeWaitForEvent(config);
        case 'exit':
          return { success: true };
        default:
          return { success: false, error: `Unknown node type: ${subtype}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute delay node
   */
  private executeDelay(config: any): any {
    const { months = 0, days = 0, hours = 0, minutes = 0 } = config;

    const delayMs =
      months * 30 * 24 * 60 * 60 * 1000 +
      days * 24 * 60 * 60 * 1000 +
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000;

    const delayUntil = new Date(Date.now() + delayMs);

    return {
      success: true,
      delayUntil,
      data: { delayMs, delayUntil: delayUntil.toISOString() },
    };
  }

  /**
   * Execute conditional split node
   */
  private executeConditionalSplit(config: any, context: ExecutionContext): any {
    const { branches } = config;

    if (!branches || !Array.isArray(branches)) {
      return {
        success: false,
        error: 'Invalid conditional_split config: missing branches',
      };
    }

    const evalData = {
      ...context.contact,
      trigger: context.triggerData,
      context: context.previousResults,
    };

    for (const branch of branches) {
      if (branch.isFallback || branch.is_fallback) {
        continue;
      }

      if (branch.conditions || branch.filters) {
        const filters = branch.conditions || branch.filters;
        const matches = this.filterEvaluationService.evaluateFilters(
          filters,
          evalData,
        );

        if (matches) {
          return {
            success: true,
            branch: branch.id,
            data: {
              matchedBranch: branch.name || branch.label,
              branchId: branch.id,
            },
          };
        }
      }
    }

    const fallbackBranch = branches.find((b) => b.isFallback || b.is_fallback);

    if (fallbackBranch) {
      return {
        success: true,
        branch: fallbackBranch.id,
        data: { matchedBranch: 'fallback', branchId: fallbackBranch.id },
      };
    }

    const defaultBranch = branches[branches.length - 1];
    return {
      success: true,
      branch: defaultBranch.id,
      data: { matchedBranch: 'default', branchId: defaultBranch.id },
    };
  }

  /**
   * Execute percentage split node
   */
  private executePercentageSplit(config: any): any {
    const { branches } = config;

    if (!branches || !Array.isArray(branches)) {
      return {
        success: false,
        error: 'Invalid percentage_split config: missing branches',
      };
    }

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const branch of branches) {
      cumulative += branch.percentage || 0;

      if (random <= cumulative) {
        return {
          success: true,
          branch: branch.id,
          data: {
            selectedBranch: branch.name || branch.label,
            branchId: branch.id,
            random: random.toFixed(2),
            percentage: branch.percentage,
          },
        };
      }
    }

    const lastBranch = branches[branches.length - 1];
    return {
      success: true,
      branch: lastBranch.id,
      data: { selectedBranch: 'fallback', branchId: lastBranch.id },
    };
  }

  /**
   * Execute wait-for-event node
   */
  private executeWaitForEvent(config: any): any {
    const { eventType, eventConfig, waitTime } = config;

    return {
      success: true,
      waitConfig: {
        eventType,
        eventConfig: eventConfig || {},
        waitTime: waitTime || { days: 7 },
      },
      data: { eventType, waitingForEvent: true },
    };
  }

  /**
   * Complete an execution
   */
  private async completeExecution(executionId: string, workflowId: string) {
    this.logger.log(`Completing execution: ${executionId}`);

    await this.knex('tbl_workflow_executions')
      .where({ id: executionId })
      .update({
        status: 'completed',
        completed_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });

    await this.knex('tbl_workflows')
      .where({ id: workflowId })
      .decrement('active_executions', 1);
  }

  /**
   * Log execution step
   */
  private async logExecutionStep(
    executionId: string,
    node: FlowNode,
    result: any,
    userId?: string,
  ) {
    await this.knex('tbl_execution_logs').insert({
      id: this.generateId(),
      user_id: userId,
      execution_id: executionId,
      node_id: node.id,
      step_id: node.data.stepId,
      node_subtype: node.data.subtype || node.data.actionType,
      status: result.success
        ? 'completed'
        : result.skipped
          ? 'skipped'
          : 'failed',
      input_data: JSON.stringify(node.data.config || {}),
      output_data: JSON.stringify(result.data || {}),
      error: result.error,
      branch_taken: result.branch,
      executed_at: this.knex.fn.now(),
    });
  }

  /**
   * Helper: Build adjacency map from edges
   */
  private buildAdjacencyMap(edges: FlowEdge[]): Map<string, FlowEdge[]> {
    const map = new Map<string, FlowEdge[]>();

    for (const edge of edges) {
      if (!map.has(edge.source)) {
        map.set(edge.source, []);
      }
      map.get(edge.source)!.push(edge);
    }

    return map;
  }

  /**
   * Helper: Get next node ID (linear flow)
   */
  private getNextNodeId(
    nodeId: string,
    adjacencyMap: Map<string, FlowEdge[]>,
  ): string | null {
    const edges = adjacencyMap.get(nodeId);
    if (!edges || edges.length === 0) return null;
    return edges[0].target;
  }

  /**
   * Helper: Get branch target ID
   */
  private getBranchTargetId(
    nodeId: string,
    branch: string,
    edges: FlowEdge[],
  ): string | null {
    const outgoing = edges.filter((e) => e.source === nodeId);
    this.logger.debug(
      `[ENGINE] getBranchTargetId: nodeId=${nodeId} branch=${branch} outgoing=${JSON.stringify(outgoing.map(e => ({ id: e.id, target: e.target, sourceHandle: e.sourceHandle })))}`,
    );
    const edge = outgoing.find((e) => e.sourceHandle === branch);
    return edge?.target ?? null;
  }

  /**
   * Helper: Generate UUID
   */
  private generateId(): string {
    return require('crypto').randomUUID();
  }
}
