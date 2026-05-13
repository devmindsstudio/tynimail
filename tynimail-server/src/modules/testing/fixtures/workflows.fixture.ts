/**
 * Sample Workflow Fixtures for Testing
 *
 * These are ready-to-use workflow definitions that demonstrate
 * different node types and execution patterns.
 */

export const SIMPLE_LINEAR_WORKFLOW = {
  name: 'Test: Simple Linear Workflow',
  description: 'Sends welcome email and adds contact to onboarded list',
  status: 'active',
  allow_reentry: false,
  exit_on_error: true,
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'contact_added_to_list',
      config: {
        listId: '{{REPLACE_WITH_LIST_ID}}',
        filters: {
          operator: 'AND',
          rules: [
            { field: 'email', operator: 'is_not_empty', value: null },
          ],
        },
      },
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'contact_added_to_list',
          label: 'Contact Added to New Subscribers',
        },
      },
      {
        id: 'action_1',
        type: 'action',
        data: {
          stepId: 1,
          subtype: 'send_email',
          label: 'Send Welcome Email',
          config: {
            subject: 'Welcome to TyniMail, {{firstName}}!',
            htmlBody: '<h1>Welcome!</h1><p>Thanks for joining, {{firstName}}. We\'re excited to have you!</p>',
          },
        },
      },
      {
        id: 'action_2',
        type: 'action',
        data: {
          stepId: 2,
          subtype: 'add_to_list',
          label: 'Add to Onboarded List',
          config: {
            listId: '{{REPLACE_WITH_ONBOARDED_LIST_ID}}',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1' },
      { id: 'e2', source: 'action_1', target: 'action_2' },
      { id: 'e3', source: 'action_2', target: 'exit_1' },
    ],
  },
};

export const WORKFLOW_WITH_DELAY = {
  name: 'Test: Workflow with Delay',
  description: 'Sends two emails with a 2-minute delay between them',
  status: 'active',
  allow_reentry: false,
  exit_on_error: true,
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'manual_entry',
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'manual_entry',
          label: 'Manual Trigger',
        },
      },
      {
        id: 'action_1',
        type: 'action',
        data: {
          stepId: 1,
          subtype: 'send_email',
          label: 'Send Email 1',
          config: {
            subject: 'Email 1: Immediate',
            htmlBody: '<p>This email sends immediately when workflow starts.</p>',
          },
        },
      },
      {
        id: 'delay_1',
        type: 'delay',
        data: {
          stepId: 2,
          subtype: 'delay',
          label: 'Wait 2 Minutes',
          config: {
            months: 0,
            days: 0,
            hours: 0,
            minutes: 2,
          },
        },
      },
      {
        id: 'action_2',
        type: 'action',
        data: {
          stepId: 3,
          subtype: 'send_email',
          label: 'Send Email 2',
          config: {
            subject: 'Email 2: After 2 Minutes',
            htmlBody: '<p>This email sends 2 minutes after Email 1.</p>',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1' },
      { id: 'e2', source: 'action_1', target: 'delay_1' },
      { id: 'e3', source: 'delay_1', target: 'action_2' },
      { id: 'e4', source: 'action_2', target: 'exit_1' },
    ],
  },
};

export const WORKFLOW_WITH_CONDITIONAL = {
  name: 'Test: Conditional Split Workflow',
  description: 'Sends different emails based on contact plan',
  status: 'active',
  allow_reentry: false,
  exit_on_error: true,
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'manual_entry',
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'manual_entry',
          label: 'Manual Trigger',
        },
      },
      {
        id: 'conditional_1',
        type: 'conditional_split',
        data: {
          stepId: 1,
          subtype: 'conditional_split',
          label: 'Check Plan Type',
          config: {
            branches: [
              {
                id: 'premium',
                name: 'Premium Users',
                conditions: {
                  operator: 'AND',
                  rules: [
                    { field: 'attributes.plan', operator: 'equals', value: 'premium' },
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
      },
      {
        id: 'action_premium',
        type: 'action',
        data: {
          stepId: 2,
          subtype: 'send_email',
          label: 'Send Premium Email',
          config: {
            subject: 'Exclusive Premium Features',
            htmlBody: '<p>Hi {{firstName}}, check out your premium features!</p>',
          },
        },
      },
      {
        id: 'action_free',
        type: 'action',
        data: {
          stepId: 2,
          subtype: 'send_email',
          label: 'Send Free Email',
          config: {
            subject: 'Upgrade to Premium',
            htmlBody: '<p>Hi {{firstName}}, upgrade to unlock premium features!</p>',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'conditional_1' },
      { id: 'e2', source: 'conditional_1', target: 'action_premium', sourceHandle: 'premium' },
      { id: 'e3', source: 'conditional_1', target: 'action_free', sourceHandle: 'free' },
      { id: 'e4', source: 'action_premium', target: 'exit_1' },
      { id: 'e5', source: 'action_free', target: 'exit_1' },
    ],
  },
};

export const WORKFLOW_WITH_PERCENTAGE_SPLIT = {
  name: 'Test: A/B Testing Workflow',
  description: 'Randomly splits contacts 50/50 for A/B testing',
  status: 'active',
  allow_reentry: false,
  exit_on_error: true,
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'manual_entry',
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'manual_entry',
          label: 'Manual Trigger',
        },
      },
      {
        id: 'percentage_1',
        type: 'percentage_split',
        data: {
          stepId: 1,
          subtype: 'percentage_split',
          label: 'A/B Split 50/50',
          config: {
            branches: [
              { id: 'variant_a', name: 'Variant A', percentage: 50 },
              { id: 'variant_b', name: 'Variant B', percentage: 50 },
            ],
          },
        },
      },
      {
        id: 'action_a',
        type: 'action',
        data: {
          stepId: 2,
          subtype: 'send_email',
          label: 'Send Variant A',
          config: {
            subject: 'Variant A: Special Offer Inside',
            htmlBody: '<p>Check out this amazing offer, {{firstName}}!</p>',
          },
        },
      },
      {
        id: 'action_b',
        type: 'action',
        data: {
          stepId: 2,
          subtype: 'send_email',
          label: 'Send Variant B',
          config: {
            subject: 'Variant B: Limited Time Deal',
            htmlBody: '<p>Don\'t miss this limited deal, {{firstName}}!</p>',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'percentage_1' },
      { id: 'e2', source: 'percentage_1', target: 'action_a', sourceHandle: 'variant_a' },
      { id: 'e3', source: 'percentage_1', target: 'action_b', sourceHandle: 'variant_b' },
      { id: 'e4', source: 'action_a', target: 'exit_1' },
      { id: 'e5', source: 'action_b', target: 'exit_1' },
    ],
  },
};

export const WORKFLOW_WITH_WAIT_FOR_EVENT = {
  name: 'Test: Wait for Email Open',
  description: 'Sends email, waits for open, sends follow-up or reminder',
  status: 'active',
  allow_reentry: false,
  exit_on_error: true,
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'manual_entry',
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'manual_entry',
          label: 'Manual Trigger',
        },
      },
      {
        id: 'action_1',
        type: 'action',
        data: {
          stepId: 1,
          subtype: 'send_email',
          label: 'Send Initial Email',
          config: {
            subject: 'Check out our new features!',
            htmlBody: '<p>We have exciting new features to show you!</p>',
          },
        },
      },
      {
        id: 'wait_1',
        type: 'wait_for_event',
        data: {
          stepId: 2,
          subtype: 'wait_for_event',
          label: 'Wait for Email Open (2 min timeout)',
          config: {
            eventType: 'email_opened',
            eventConfig: {},
            waitTime: {
              months: 0,
              days: 0,
              hours: 0,
              minutes: 2, // Short timeout for testing
            },
          },
        },
      },
      {
        id: 'action_opened',
        type: 'action',
        data: {
          stepId: 3,
          subtype: 'send_email',
          label: 'Send Follow-up (Opened)',
          config: {
            subject: 'Thanks for checking out our features!',
            htmlBody: '<p>We\'re glad you\'re interested! Here\'s more info...</p>',
          },
        },
      },
      {
        id: 'action_not_opened',
        type: 'action',
        data: {
          stepId: 3,
          subtype: 'send_email',
          label: 'Send Reminder (Not Opened)',
          config: {
            subject: 'Did you miss our email?',
            htmlBody: '<p>Just a friendly reminder to check out our new features!</p>',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1' },
      { id: 'e2', source: 'action_1', target: 'wait_1' },
      { id: 'e3', source: 'wait_1', target: 'action_opened', sourceHandle: 'yes' },
      { id: 'e4', source: 'wait_1', target: 'action_not_opened', sourceHandle: 'no' },
      { id: 'e5', source: 'action_opened', target: 'exit_1' },
      { id: 'e6', source: 'action_not_opened', target: 'exit_1' },
    ],
  },
};

export const COMPLEX_WORKFLOW = {
  name: 'Test: Complex Multi-Step Workflow',
  description: 'Combines delays, conditionals, and multiple actions',
  status: 'active',
  allow_reentry: false,
  exit_on_error: false, // Continue on errors
  triggers: [
    {
      id: 'trigger_1',
      type: 'event',
      subtype: 'contact_added_to_list',
      config: {
        listId: '{{REPLACE_WITH_LIST_ID}}',
      },
    },
  ],
  flow_data: {
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        data: {
          subtype: 'contact_added_to_list',
          label: 'Contact Joins',
        },
      },
      {
        id: 'action_1',
        type: 'action',
        data: {
          stepId: 1,
          subtype: 'send_email',
          label: 'Welcome Email',
          config: {
            subject: 'Welcome {{firstName}}!',
            htmlBody: '<h1>Welcome!</h1>',
          },
        },
      },
      {
        id: 'delay_1',
        type: 'delay',
        data: {
          stepId: 2,
          subtype: 'delay',
          label: 'Wait 1 Minute',
          config: { minutes: 1 },
        },
      },
      {
        id: 'conditional_1',
        type: 'conditional_split',
        data: {
          stepId: 3,
          subtype: 'conditional_split',
          label: 'Check Engagement',
          config: {
            branches: [
              {
                id: 'engaged',
                name: 'Engaged',
                conditions: {
                  operator: 'AND',
                  rules: [
                    { field: 'attributes.engaged', operator: 'equals', value: true },
                  ],
                },
              },
              {
                id: 'not_engaged',
                name: 'Not Engaged',
                isFallback: true,
              },
            ],
          },
        },
      },
      {
        id: 'action_engaged',
        type: 'action',
        data: {
          stepId: 4,
          subtype: 'add_to_list',
          label: 'Add to Engaged List',
          config: {
            listId: '{{REPLACE_WITH_ENGAGED_LIST_ID}}',
          },
        },
      },
      {
        id: 'action_not_engaged',
        type: 'action',
        data: {
          stepId: 4,
          subtype: 'send_email',
          label: 'Send Re-engagement Email',
          config: {
            subject: 'We miss you!',
            htmlBody: '<p>Come back and engage with us!</p>',
          },
        },
      },
      {
        id: 'exit_1',
        type: 'exit',
        data: {
          subtype: 'exit',
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1' },
      { id: 'e2', source: 'action_1', target: 'delay_1' },
      { id: 'e3', source: 'delay_1', target: 'conditional_1' },
      { id: 'e4', source: 'conditional_1', target: 'action_engaged', sourceHandle: 'engaged' },
      { id: 'e5', source: 'conditional_1', target: 'action_not_engaged', sourceHandle: 'not_engaged' },
      { id: 'e6', source: 'action_engaged', target: 'exit_1' },
      { id: 'e7', source: 'action_not_engaged', target: 'exit_1' },
    ],
  },
};

export const ALL_WORKFLOW_FIXTURES = [
  SIMPLE_LINEAR_WORKFLOW,
  WORKFLOW_WITH_DELAY,
  WORKFLOW_WITH_CONDITIONAL,
  WORKFLOW_WITH_PERCENTAGE_SPLIT,
  WORKFLOW_WITH_WAIT_FOR_EVENT,
  COMPLEX_WORKFLOW,
];
