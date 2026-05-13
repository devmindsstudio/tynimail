/**
 * Workflow Status Constants
 */
export const WORKFLOW_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    ARCHIVED: 'archived'
} as const;

export type WorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

/**
 * Workflow Execution Status Constants
 */
export const EXECUTION_STATUS = {
    RUNNING: 'running',
    WAITING: 'waiting',
    WAITING_FOR_EVENT: 'waiting_for_event',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
} as const;

export type ExecutionStatus = typeof EXECUTION_STATUS[keyof typeof EXECUTION_STATUS];

/**
 * Execution Log Status Constants
 */
export const LOG_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped'
} as const;

export type LogStatus = typeof LOG_STATUS[keyof typeof LOG_STATUS];

/**
 * Node Types
 */
export const NODE_TYPES = {
    TRIGGER: 'trigger',
    ACTION: 'action',
    RULE: 'rule'
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

/**
 * Trigger Subtypes
 */
export const TRIGGER_SUBTYPES = {
    MANUAL_ENTRY: 'manual_entry',
    CONTACT_ADDED_TO_LIST: 'contact_added_to_list',
    CONTACT_REMOVED_FROM_LIST: 'contact_removed_from_list',
    EMAIL_OPENED: 'email_opened',
    EMAIL_LINK_CLICKED: 'email_link_clicked',
    CUSTOM_EVENT: 'custom_event',
    FORM_SUBMITTED: 'form_submitted',
    CONTACT_MATCHES_FILTER: 'contact_matches_filter',
    ANNIVERSARY: 'anniversary',
    WEBPAGE_VISITED: 'webpage_visited',
    UNSUBSCRIBED: 'unsubscribed'
} as const;

export type TriggerSubtype = typeof TRIGGER_SUBTYPES[keyof typeof TRIGGER_SUBTYPES];

/**
 * Action Subtypes
 */
export const ACTION_SUBTYPES = {
    SEND_EMAIL: 'send_email',
    ADD_TO_LIST: 'add_to_list',
    REMOVE_FROM_LIST: 'remove_from_list',
    UPDATE_CONTACT: 'update_contact',
    SEND_WEBHOOK: 'send_webhook',
    BLOCKLIST_CONTACT: 'blocklist_contact',
    ASSIGN_USER: 'assign_user'
} as const;

export type ActionSubtype = typeof ACTION_SUBTYPES[keyof typeof ACTION_SUBTYPES];

/**
 * Rule Subtypes
 */
export const RULE_SUBTYPES = {
    DELAY: 'delay',
    CONDITIONAL_SPLIT: 'conditional_split',
    PERCENTAGE_SPLIT: 'percentage_split',
    WAIT_FOR_EVENT: 'wait_for_event',
    EXIT: 'exit'
} as const;

export type RuleSubtype = typeof RULE_SUBTYPES[keyof typeof RULE_SUBTYPES];
