/**
 * Action Executor Interface
 * All action executors must implement this interface
 */
export interface ActionExecutionContext {
  userId: string;
  contactId: string;
  executionId: string;
  workflowId: string;
  nodeId?: string; // Current node ID — used by assign_user for round-robin state
  contact?: any; // Will be populated by the executor
  triggerData?: Record<string, any>;
  previousResults?: Record<string, any>;
}

export interface ActionExecutionResult {
  success: boolean;
  skipped?: boolean;
  contactDeleted?: boolean; // Set by delete_contact — signals engine to stop walking
  data?: Record<string, any>;
  error?: string;
  reason?: string;
}

export interface IActionExecutor {
  /**
   * Execute the action with the given config and context
   */
  execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult>;
}
