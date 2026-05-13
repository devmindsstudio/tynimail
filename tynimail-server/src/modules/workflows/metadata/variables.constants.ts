/**
 * Variable Metadata
 *
 * Defines available variables for interpolation in email templates
 * and other text fields (e.g., {{firstName}}, {{attributes.plan}})
 */

export interface VariableMetadata {
  id: string;
  label: string;
  path: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  description?: string;
  example?: string;
}

export const CONTACT_FIELD_VARIABLES: VariableMetadata[] = [
  {
    id: 'firstName',
    label: 'First Name',
    path: 'firstName',
    category: 'contact',
    type: 'string',
    description: 'Contact\'s first name',
    example: 'John',
  },
  {
    id: 'lastName',
    label: 'Last Name',
    path: 'lastName',
    category: 'contact',
    type: 'string',
    description: 'Contact\'s last name',
    example: 'Doe',
  },
  {
    id: 'email',
    label: 'Email Address',
    path: 'email',
    category: 'contact',
    type: 'string',
    description: 'Contact\'s email address',
    example: 'john@example.com',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    path: 'phone',
    category: 'contact',
    type: 'string',
    description: 'Contact\'s phone number',
    example: '+1234567890',
  },
];

export const CUSTOM_ATTRIBUTE_VARIABLES: VariableMetadata[] = [
  {
    id: 'attributes',
    label: 'Custom Attributes',
    path: 'attributes',
    category: 'custom',
    type: 'string',
    description: 'Access custom attributes using dot notation',
    example: '{{attributes.plan}} or {{attributes.company}}',
  },
];

export const SYSTEM_VARIABLES: VariableMetadata[] = [
  {
    id: 'currentDate',
    label: 'Current Date',
    path: 'system.currentDate',
    category: 'system',
    type: 'date',
    description: 'Current date and time',
    example: '2026-02-12',
  },
  {
    id: 'currentYear',
    label: 'Current Year',
    path: 'system.currentYear',
    category: 'system',
    type: 'number',
    description: 'Current year',
    example: '2026',
  },
  {
    id: 'workflowName',
    label: 'Workflow Name',
    path: 'system.workflowName',
    category: 'system',
    type: 'string',
    description: 'Name of the current workflow',
  },
];

export const TRIGGER_DATA_VARIABLES: VariableMetadata[] = [
  {
    id: 'triggerData',
    label: 'Trigger Data',
    path: 'trigger',
    category: 'trigger',
    type: 'string',
    description: 'Data from the event that triggered this workflow',
    example: '{{trigger.campaignId}} or {{trigger.listId}}',
  },
];

export const ALL_VARIABLES = {
  contactFields: CONTACT_FIELD_VARIABLES,
  customAttributes: CUSTOM_ATTRIBUTE_VARIABLES,
  systemFields: SYSTEM_VARIABLES,
  triggerData: TRIGGER_DATA_VARIABLES,
};

export const VARIABLE_CATEGORIES = [
  { id: 'contact', name: 'Contact Fields', icon: 'user' },
  { id: 'custom', name: 'Custom Attributes', icon: 'tag' },
  { id: 'system', name: 'System', icon: 'settings' },
  { id: 'trigger', name: 'Trigger Data', icon: 'zap' },
];
