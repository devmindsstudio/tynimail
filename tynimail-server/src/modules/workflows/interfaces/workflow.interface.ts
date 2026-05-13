import { WorkflowStatus, TriggerSubtype, NodeType, ActionSubtype, RuleSubtype } from '@/constants';

/**
 * Workflow Entity Interface
 */
export interface IWorkflow {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    status: WorkflowStatus;
    triggers: ITriggerConfig[] | null;
    flow_data: IFlowData | null;
    allow_reentry: boolean;
    exit_on_error: boolean;
    total_executions: number;
    active_executions: number;
    created_at: Date;
    updated_at: Date;
    activated_at: Date | null;
}

/**
 * Flow Data Structure (React Flow format)
 */
export interface IFlowData {
    nodes: IFlowNode[];
    edges: IFlowEdge[];
}

/**
 * Flow Node (React Flow node)
 */
export interface IFlowNode {
    id: string;
    type: NodeType;
    position: {
        x: number;
        y: number;
    };
    data: INodeData;
}

/**
 * Node Data (configuration)
 */
export interface INodeData {
    label: string;
    subtype: TriggerSubtype | ActionSubtype | RuleSubtype;
    config: any; // Node-specific configuration
}

/**
 * Flow Edge (React Flow edge)
 */
export interface IFlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string; // For conditional/percentage splits
    targetHandle?: string;
    type?: string;
}

/**
 * Trigger Configuration (extracted from flow_data for fast querying)
 */
export interface ITriggerConfig {
    nodeId: string;
    subtype: TriggerSubtype;
    config: any; // Trigger-specific config (filters, conditions, etc.)
}

/**
 * Workflow Statistics
 */
export interface IWorkflowStats {
    total_executions: number;
    active_executions: number;
    completed_executions: number;
    failed_executions: number;
    average_duration_minutes: number;
}

/**
 * Workflow with related data
 */
export interface IWorkflowWithStats extends IWorkflow {
    stats?: IWorkflowStats;
}
