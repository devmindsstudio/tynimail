/**
 * Node Type Metadata Definitions
 *
 * Single source of truth for all workflow node types.
 * Used to generate frontend node palette and configuration forms.
 */

export interface NodeTypeMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  configSchema: ConfigSchema;
  examples?: ConfigExample[];
  documentation?: string;
}

export interface ConfigSchema {
  type: 'object';
  required?: string[];
  properties: Record<string, ConfigProperty>;
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  label?: string;
  inputType?: string;
  placeholder?: string;
  default?: any;
  supportsVariables?: boolean;
  description?: string;
  items?: Partial<ConfigProperty>;
  properties?: Record<string, ConfigProperty>;
}

export interface ConfigExample {
  name: string;
  description?: string;
  config: Record<string, any>;
}

// ========================================
// TRIGGER NODE TYPES
// ========================================

export const TRIGGER_NODE_TYPES: NodeTypeMetadata[] = [
  {
    id: 'manual_entry',
    name: 'Manual Trigger',
    description:
      'Manually trigger this workflow for testing or one-off executions',
    category: 'manual',
    icon: 'play-circle',
    color: '#6366f1',
    configSchema: {
      type: 'object',
      properties: {},
    },
    examples: [
      {
        name: 'Test Workflow',
        description: 'Use this to test workflows during development',
        config: {},
      },
    ],
  },
  {
    id: 'contact_added_to_list',
    name: 'Contact Added to List',
    description:
      'Triggers when a contact is added to a specific list or segment',
    category: 'list_events',
    icon: 'user-plus',
    color: '#3b82f6',
    configSchema: {
      type: 'object',
      required: ['listId'],
      properties: {
        listId: {
          type: 'string',
          label: 'Select List',
          inputType: 'list-picker',
          description:
            'The list that triggers this workflow when contacts are added',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
          description:
            'Optional: Only trigger for contacts matching these conditions',
        },
      },
    },
    examples: [
      {
        name: 'New Subscribers',
        description: 'Trigger when contacts join your newsletter',
        config: {
          listId: 'list-uuid',
          filters: {
            operator: 'AND',
            rules: [{ field: 'email', operator: 'is_not_empty', value: null }],
          },
        },
      },
    ],
  },
  {
    id: 'contact_removed_from_list',
    name: 'Contact Removed from List',
    description: 'Triggers when a contact is removed from a specific list',
    category: 'list_events',
    icon: 'user-minus',
    color: '#ef4444',
    configSchema: {
      type: 'object',
      required: ['listId'],
      properties: {
        listId: {
          type: 'string',
          label: 'Select List',
          inputType: 'list-picker',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
        },
      },
    },
  },
  {
    id: 'email_opened',
    name: 'Email Opened',
    description: 'Triggers when a contact opens an email',
    category: 'email_events',
    icon: 'mail-open',
    color: '#8b5cf6',
    configSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'string',
          label: 'Campaign (optional)',
          inputType: 'campaign-picker',
          description: 'Only trigger for emails from this campaign',
        },
        workflowId: {
          type: 'string',
          label: 'Workflow (optional)',
          inputType: 'workflow-picker',
          description: 'Only trigger for emails sent by this workflow',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
        },
      },
    },
    examples: [
      {
        name: 'Engaged Subscribers',
        description: 'Trigger when welcome email is opened',
        config: {
          campaignId: 'welcome-campaign',
        },
      },
    ],
  },
  {
    id: 'email_clicked',
    name: 'Email Link Clicked',
    description: 'Triggers when a contact clicks a link in an email',
    category: 'email_events',
    icon: 'mouse-pointer-click',
    color: '#a855f7',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          label: 'URL Pattern (optional)',
          inputType: 'text',
          placeholder: 'https://example.com/signup',
          description: 'Only trigger for clicks on URLs matching this pattern',
        },
        campaignId: {
          type: 'string',
          label: 'Campaign (optional)',
          inputType: 'campaign-picker',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
        },
      },
    },
  },
  {
    id: 'form_submitted',
    name: 'Form Submitted',
    description: 'Triggers when a contact submits a form',
    category: 'form_events',
    icon: 'file-text',
    color: '#14b8a6',
    configSchema: {
      type: 'object',
      required: ['formId'],
      properties: {
        formId: {
          type: 'string',
          label: 'Select Form',
          inputType: 'form-picker',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
        },
      },
    },
  },
  {
    id: 'custom_event',
    name: 'Custom Event',
    description: 'Triggers when a custom event is fired via API',
    category: 'custom',
    icon: 'zap',
    color: '#f59e0b',
    configSchema: {
      type: 'object',
      required: ['eventName'],
      properties: {
        eventName: {
          type: 'string',
          label: 'Event Name',
          inputType: 'text',
          placeholder: 'product_purchased',
          description: 'The custom event name to listen for',
        },
        filters: {
          type: 'object',
          label: 'Event Property Filters',
          inputType: 'filter-builder',
          description: 'Filter based on event properties',
        },
      },
    },
    examples: [
      {
        name: 'Product Purchase',
        description: 'Trigger when a product is purchased',
        config: {
          eventName: 'product_purchased',
          filters: {
            operator: 'AND',
            rules: [
              {
                field: 'properties.amount',
                operator: 'greater_than',
                value: 100,
              },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Triggers annually on a date stored in a contact attribute (e.g., birthday, signup anniversary)',
    category: 'cron',
    icon: 'calendar-heart',
    color: '#ec4899',
    configSchema: {
      type: 'object',
      required: ['dateAttribute', 'entryTime'],
      properties: {
        dateAttribute: {
          type: 'string',
          label: 'Date Attribute',
          inputType: 'text',
          placeholder: 'BIRTHDAY',
          description: 'Contact attribute name holding an ISO date (e.g., BIRTHDAY)',
        },
        timing: {
          type: 'string',
          label: 'Timing',
          inputType: 'select',
          default: 'same_day',
          description: 'When to trigger relative to the anniversary date',
        },
        offset: {
          type: 'object',
          label: 'Offset',
          inputType: 'duration',
          description: 'Number of days before or after the anniversary date',
          properties: {
            value: { type: 'number', label: 'Days', default: 0 },
            unit: { type: 'string', label: 'Unit', default: 'days' },
          },
        },
        entryTime: {
          type: 'string',
          label: 'Run Time (UTC)',
          inputType: 'time',
          placeholder: '09:00',
          description: 'UTC time to evaluate this trigger daily (HH:MM)',
        },
        filters: {
          type: 'object',
          label: 'Additional Filters',
          inputType: 'filter-builder',
          description: 'Only trigger for contacts matching these conditions',
        },
      },
    },
    examples: [
      {
        name: 'Birthday Email',
        description: 'Send a birthday email on the contact\'s birthday',
        config: {
          dateAttribute: 'BIRTHDAY',
          timing: 'same_day',
          entryTime: '09:00',
        },
      },
      {
        name: '7 Days Before Birthday',
        config: {
          dateAttribute: 'BIRTHDAY',
          timing: 'before',
          offset: { value: 7, unit: 'days' },
          entryTime: '08:00',
        },
      },
    ],
  },
  {
    id: 'contact_in_segment',
    name: 'Contact In Segment',
    description: 'Triggers daily for all contacts currently in a given segment',
    category: 'cron',
    icon: 'users-round',
    color: '#0ea5e9',
    configSchema: {
      type: 'object',
      required: ['segmentId', 'entryTime'],
      properties: {
        segmentId: {
          type: 'string',
          label: 'Segment',
          inputType: 'segment-picker',
          description: 'The segment to evaluate daily',
        },
        entryTime: {
          type: 'string',
          label: 'Run Time (UTC)',
          inputType: 'time',
          placeholder: '09:00',
          description: 'UTC time to evaluate this trigger daily (HH:MM)',
        },
      },
    },
    examples: [
      {
        name: 'Daily Segment Check',
        config: {
          segmentId: 'segment-uuid',
          entryTime: '08:00',
        },
      },
    ],
  },
  {
    id: 'contact_matches_filter',
    name: 'Contact Matches Filter',
    description: 'Triggers daily for all contacts that match a set of filter conditions',
    category: 'cron',
    icon: 'filter',
    color: '#84cc16',
    configSchema: {
      type: 'object',
      required: ['filters', 'entryTime'],
      properties: {
        filters: {
          type: 'object',
          label: 'Filter Conditions',
          inputType: 'filter-builder',
          description: 'Contacts matching these conditions will enter the workflow',
        },
        entryTime: {
          type: 'string',
          label: 'Run Time (UTC)',
          inputType: 'time',
          placeholder: '09:00',
          description: 'UTC time to evaluate this trigger daily (HH:MM)',
        },
      },
    },
    examples: [
      {
        name: 'Inactive Users',
        description: 'Trigger for contacts who haven\'t opened an email in 30 days',
        config: {
          filters: {
            operator: 'AND',
            rules: [{ field: 'attributes.last_open_days_ago', operator: 'greater_than', value: 30 }],
          },
          entryTime: '07:00',
        },
      },
    ],
  },
  {
    id: 'webpage_visited',
    name: 'Webpage Visited',
    description: 'Triggers when an identified contact visits a tracked page on your website',
    category: 'website',
    icon: 'globe',
    color: '#06b6d4',
    configSchema: {
      type: 'object',
      properties: {
        websiteFilters: {
          type: 'object',
          label: 'URL Conditions',
          inputType: 'url-filter-builder',
          description: 'Only trigger for specific pages (optional — leave empty to match all pages)',
          properties: {
            conditions: {
              type: 'array',
              label: 'Conditions',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', label: 'Field', inputType: 'select', description: 'url | path | title | referrer' },
                  operator: { type: 'string', label: 'Operator', inputType: 'select' },
                  value: { type: 'string', label: 'Value', inputType: 'text' },
                },
              },
            },
          },
        },
        filters: {
          type: 'object',
          label: 'Contact Filters',
          inputType: 'filter-builder',
          description: 'Only trigger for contacts matching these conditions',
        },
      },
    },
    examples: [
      {
        name: 'Pricing Page Visit',
        description: 'Trigger when a contact visits the pricing page',
        config: {
          websiteFilters: {
            conditions: [{ field: 'path', operator: 'contains', value: '/pricing' }],
          },
        },
      },
    ],
  },
];

// ========================================
// ACTION NODE TYPES
// ========================================

export const ACTION_NODE_TYPES: NodeTypeMetadata[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send an email to the contact',
    category: 'communication',
    icon: 'mail',
    color: '#10b981',
    configSchema: {
      type: 'object',
      required: ['subject', 'htmlBody'],
      properties: {
        subject: {
          type: 'string',
          label: 'Email Subject',
          inputType: 'text',
          placeholder: 'Welcome {{firstName}}!',
          supportsVariables: true,
          description: 'Subject line supports variables like {{firstName}}',
        },
        htmlBody: {
          type: 'string',
          label: 'Email Body',
          inputType: 'rich-text',
          supportsVariables: true,
          description: 'HTML email content',
        },
        textBody: {
          type: 'string',
          label: 'Plain Text Body (optional)',
          inputType: 'textarea',
          supportsVariables: true,
        },
        fromName: {
          type: 'string',
          label: 'From Name',
          inputType: 'text',
          default: 'TyniMail',
          placeholder: 'Your Company',
        },
        fromEmail: {
          type: 'string',
          label: 'From Email (optional)',
          inputType: 'text',
          placeholder: 'noreply@yourdomain.com',
          description: 'Leave empty to use default sender email',
        },
      },
    },
    examples: [
      {
        name: 'Welcome Email',
        config: {
          subject: 'Welcome to {{companyName}}, {{firstName}}!',
          htmlBody:
            '<h1>Welcome!</h1><p>Thanks for joining, {{firstName}}!</p>',
          fromName: 'TyniMail Team',
        },
      },
    ],
  },
  {
    id: 'add_to_list',
    name: 'Add to List',
    description: 'Add the contact to a list or segment',
    category: 'list_management',
    icon: 'list-plus',
    color: '#f59e0b',
    configSchema: {
      type: 'object',
      required: ['listId'],
      properties: {
        listId: {
          type: 'string',
          label: 'Select List',
          inputType: 'list-picker',
          description: 'The list to add the contact to',
        },
      },
    },
    examples: [
      {
        name: 'Add to Onboarded',
        config: {
          listId: 'onboarded-list-uuid',
        },
      },
    ],
  },
  {
    id: 'remove_from_list',
    name: 'Remove from List',
    description: 'Remove the contact from a list or segment',
    category: 'list_management',
    icon: 'list-minus',
    color: '#ef4444',
    configSchema: {
      type: 'object',
      required: ['listId'],
      properties: {
        listId: {
          type: 'string',
          label: 'Select List',
          inputType: 'list-picker',
          description: 'The list to remove the contact from',
        },
      },
    },
  },
  {
    id: 'update_contact',
    name: 'Update Contact',
    description: 'Update contact fields or custom attributes',
    category: 'contact_management',
    icon: 'user-cog',
    color: '#06b6d4',
    configSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          label: 'First Name',
          inputType: 'text',
          supportsVariables: true,
        },
        lastName: {
          type: 'string',
          label: 'Last Name',
          inputType: 'text',
          supportsVariables: true,
        },
        email: {
          type: 'string',
          label: 'Email',
          inputType: 'email',
          supportsVariables: true,
        },
        phone: {
          type: 'string',
          label: 'Phone',
          inputType: 'text',
          supportsVariables: true,
        },
        attributes: {
          type: 'object',
          label: 'Custom Attributes',
          inputType: 'key-value-editor',
          description: 'Set custom attributes on the contact',
        },
      },
    },
    examples: [
      {
        name: 'Mark as Onboarded',
        config: {
          attributes: {
            onboarded: true,
            onboarded_at: '{{system.currentDate}}',
          },
        },
      },
    ],
  },
  {
    id: 'notify_email',
    name: 'Notify by Email',
    description: 'Send an internal notification email to team members',
    category: 'notification',
    icon: 'bell',
    color: '#f59e0b',
    configSchema: {
      type: 'object',
      properties: {
        sender: {
          type: 'object',
          label: 'Sender',
          properties: {
            email: { type: 'string', label: 'From Email', inputType: 'email' },
          },
        },
        recipients: {
          type: 'object',
          label: 'Recipients',
          properties: {
            type: {
              type: 'string',
              label: 'Recipient Type',
              inputType: 'select',
              description: 'specific | attribute',
            },
            emails: {
              type: 'array',
              label: 'Email Addresses',
              inputType: 'tags',
              description: 'Required when type is specific',
            },
            attributeKey: {
              type: 'string',
              label: 'Contact Attribute Key',
              inputType: 'text',
              description: 'Required when type is attribute',
            },
          },
        },
        content: {
          type: 'object',
          label: 'Email Content',
          properties: {
            subject: {
              type: 'string',
              label: 'Subject',
              inputType: 'text',
              supportsVariables: true,
            },
            body: {
              type: 'string',
              label: 'Body (HTML)',
              inputType: 'html-editor',
              supportsVariables: true,
            },
            eventDataSource: {
              type: 'string',
              label: 'Include Event Data',
              inputType: 'select',
              default: 'none',
              description: 'none | trigger',
            },
          },
        },
      },
    },
    examples: [
      {
        name: 'New Lead Alert',
        config: {
          recipients: { type: 'specific', emails: ['sales@company.com'] },
          content: {
            subject: 'New lead: {{firstName}} {{lastName}}',
            body: '<p>Contact <strong>{{email}}</strong> just entered the workflow.</p>',
          },
        },
      },
    ],
  },
  {
    id: 'call_webhook',
    name: 'Call a Webhook',
    description: 'Send an HTTP POST request to an external URL',
    category: 'integration',
    icon: 'webhook',
    color: '#8b5cf6',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          label: 'Webhook URL',
          inputType: 'text',
          placeholder: 'https://hooks.slack.com/services/...',
        },
        includeContactDetails: {
          type: 'boolean',
          label: 'Include Contact Details',
          inputType: 'toggle',
          default: false,
        },
        includeTriggerEvent: {
          type: 'boolean',
          label: 'Include Trigger Event Data',
          inputType: 'toggle',
          default: false,
        },
      },
    },
    examples: [
      {
        name: 'Slack Notification',
        config: {
          url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
          includeContactDetails: true,
          includeTriggerEvent: false,
        },
      },
    ],
  },
  {
    id: 'blocklist_contact',
    name: 'Blocklist Contact',
    description: 'Block the contact from receiving marketing or all emails',
    category: 'contact_management',
    icon: 'ban',
    color: '#ef4444',
    configSchema: {
      type: 'object',
      properties: {
        blockType: {
          type: 'string',
          label: 'Block Type',
          inputType: 'select',
          default: 'marketing',
          description: 'marketing | all | compliance',
        },
      },
    },
    examples: [
      {
        name: 'Unsubscribe from Marketing',
        config: { blockType: 'marketing' },
      },
    ],
  },
  {
    id: 'assign_user',
    name: 'Assign a User',
    description: 'Set a team member as the owner of this contact',
    category: 'contact_management',
    icon: 'user-plus',
    color: '#06b6d4',
    configSchema: {
      type: 'object',
      properties: {
        assignmentType: {
          type: 'string',
          label: 'Assignment Type',
          inputType: 'select',
          default: 'specific',
          description: 'specific | round_robin',
        },
        userId: {
          type: 'string',
          label: 'User',
          inputType: 'user-select',
          description: 'Required when assignmentType is specific',
        },
        userIds: {
          type: 'array',
          label: 'Users (Round Robin)',
          inputType: 'user-multi-select',
          description: 'Required when assignmentType is round_robin',
        },
      },
    },
    examples: [
      {
        name: 'Assign to Sales Rep',
        config: { assignmentType: 'specific', userId: 'user-uuid-here' },
      },
      {
        name: 'Round-Robin Assignment',
        config: {
          assignmentType: 'round_robin',
          userIds: ['user-a', 'user-b', 'user-c'],
        },
      },
    ],
  },
  {
    id: 'delete_contact',
    name: 'Delete Contact',
    description: 'Permanently delete the contact and all their data. Cannot be undone.',
    category: 'contact_management',
    icon: 'trash',
    color: '#dc2626',
    configSchema: {
      type: 'object',
      properties: {},
    },
    examples: [
      {
        name: 'Delete Contact',
        config: {},
      },
    ],
  },
];

// ========================================
// RULE/CONTROL FLOW NODE TYPES
// ========================================

export const RULE_NODE_TYPES: NodeTypeMetadata[] = [
  {
    id: 'delay',
    name: 'Delay',
    description: 'Wait for a specified duration before continuing',
    category: 'timing',
    icon: 'clock',
    color: '#6366f1',
    configSchema: {
      type: 'object',
      properties: {
        months: {
          type: 'number',
          label: 'Months',
          inputType: 'number',
          default: 0,
        },
        days: {
          type: 'number',
          label: 'Days',
          inputType: 'number',
          default: 0,
        },
        hours: {
          type: 'number',
          label: 'Hours',
          inputType: 'number',
          default: 0,
        },
        minutes: {
          type: 'number',
          label: 'Minutes',
          inputType: 'number',
          default: 0,
        },
      },
    },
    examples: [
      {
        name: 'Wait 2 Days',
        config: { days: 2 },
      },
      {
        name: 'Wait 1 Hour',
        config: { hours: 1 },
      },
    ],
  },
  {
    id: 'conditional_split',
    name: 'Conditional Split',
    description: 'Branch the workflow based on contact attributes',
    category: 'branching',
    icon: 'git-branch',
    color: '#ec4899',
    configSchema: {
      type: 'object',
      required: ['branches'],
      properties: {
        branches: {
          type: 'array',
          label: 'Branches',
          inputType: 'branch-builder',
          description: 'Define conditions for each branch',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                label: 'Branch ID',
                inputType: 'text',
              },
              name: {
                type: 'string',
                label: 'Branch Name',
                inputType: 'text',
                placeholder: 'Premium Users',
              },
              conditions: {
                type: 'object',
                label: 'Conditions',
                inputType: 'filter-builder',
              },
              isFallback: {
                type: 'boolean',
                label: 'Fallback Branch',
                inputType: 'checkbox',
                default: false,
                description: 'Use this branch if no conditions match',
              },
            },
          },
        },
      },
    },
    examples: [
      {
        name: 'Plan-Based Split',
        config: {
          branches: [
            {
              id: 'premium',
              name: 'Premium Users',
              conditions: {
                operator: 'AND',
                rules: [
                  {
                    field: 'attributes.plan',
                    operator: 'equals',
                    value: 'premium',
                  },
                ],
              },
            },
            {
              id: 'free',
              name: 'Free Users',
              isFallback: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'percentage_split',
    name: 'A/B Split',
    description: 'Randomly split contacts into groups (A/B testing)',
    category: 'branching',
    icon: 'shuffle',
    color: '#8b5cf6',
    configSchema: {
      type: 'object',
      required: ['branches'],
      properties: {
        branches: {
          type: 'array',
          label: 'Branches',
          inputType: 'percentage-builder',
          description: 'Define percentage distribution',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                label: 'Branch ID',
                inputType: 'text',
              },
              name: {
                type: 'string',
                label: 'Branch Name',
                inputType: 'text',
                placeholder: 'Variant A',
              },
              percentage: {
                type: 'number',
                label: 'Percentage',
                inputType: 'number',
                default: 50,
                description: 'Percentage of contacts (0-100)',
              },
            },
          },
        },
      },
    },
    examples: [
      {
        name: '50/50 A/B Test',
        config: {
          branches: [
            { id: 'variant_a', name: 'Variant A', percentage: 50 },
            { id: 'variant_b', name: 'Variant B', percentage: 50 },
          ],
        },
      },
    ],
  },
  {
    id: 'wait_for_event',
    name: 'Wait for Event',
    description: 'Pause workflow until a specific event occurs or timeout',
    category: 'timing',
    icon: 'pause-circle',
    color: '#14b8a6',
    configSchema: {
      type: 'object',
      required: ['eventType', 'waitTime'],
      properties: {
        eventType: {
          type: 'string',
          label: 'Event Type',
          inputType: 'event-picker',
          description: 'The event to wait for',
        },
        eventConfig: {
          type: 'object',
          label: 'Event Filters',
          inputType: 'filter-builder',
          description: 'Optional: Match specific event properties',
        },
        waitTime: {
          type: 'object',
          label: 'Timeout Duration',
          inputType: 'duration',
          description: 'Maximum time to wait before timeout',
          properties: {
            months: { type: 'number', label: 'Months', default: 0 },
            days: { type: 'number', label: 'Days', default: 7 },
            hours: { type: 'number', label: 'Hours', default: 0 },
            minutes: { type: 'number', label: 'Minutes', default: 0 },
          },
        },
      },
    },
    examples: [
      {
        name: 'Wait for Email Open',
        description: 'Wait up to 7 days for contact to open email',
        config: {
          eventType: 'email_opened',
          waitTime: { days: 7 },
        },
      },
    ],
  },
  {
    id: 'exit',
    name: 'Exit',
    description: 'End the workflow execution',
    category: 'control',
    icon: 'square',
    color: '#64748b',
    configSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ========================================
// AGGREGATED EXPORTS
// ========================================

export const ALL_NODE_TYPES = {
  triggers: TRIGGER_NODE_TYPES,
  actions: ACTION_NODE_TYPES,
  rules: RULE_NODE_TYPES,
};

export const NODE_TYPE_CATEGORIES = {
  triggers: [
    { id: 'manual', name: 'Manual', icon: 'play' },
    { id: 'list_events', name: 'List Events', icon: 'users' },
    { id: 'email_events', name: 'Email Events', icon: 'mail' },
    { id: 'form_events', name: 'Form Events', icon: 'file-text' },
    { id: 'custom', name: 'Custom', icon: 'code' },
    { id: 'cron', name: 'Scheduled', icon: 'calendar' },
    { id: 'website', name: 'Website', icon: 'globe' },
  ],
  actions: [
    { id: 'communication', name: 'Communication', icon: 'mail' },
    { id: 'list_management', name: 'List Management', icon: 'list' },
    { id: 'contact_management', name: 'Contact Management', icon: 'user' },
  ],
  rules: [
    { id: 'timing', name: 'Timing', icon: 'clock' },
    { id: 'branching', name: 'Branching', icon: 'git-branch' },
    { id: 'control', name: 'Control', icon: 'settings' },
  ],
};
