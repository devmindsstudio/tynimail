import { TriggerNode } from '../nodes/TriggerNode';
import { ActionNode } from '../nodes/ActionNode';
import { DelayNode } from '../nodes/DelayNode';
import { ConditionalSplitNode } from '../nodes/ConditionalSplitNode';
import { PercentageSplitNode } from '../nodes/PercentageSplitNode';
import { WaitForEventNode } from '../nodes/WaitForEventNode';
import { ExitNode } from '../nodes/ExitNode';
import { BranchLabelNode } from '../nodes/BranchLabelNode';
import { DropZoneNode } from '../nodes/DropZoneNode';

// Node type → React Flow component map.
// Must be defined OUTSIDE any React component for stable reference.
export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  conditionalSplit: ConditionalSplitNode,
  percentageSplit: PercentageSplitNode,
  waitForEvent: WaitForEventNode,
  exit: ExitNode,
  branchLabel: BranchLabelNode,
  dropZone: DropZoneNode,
};

export const PALETTE = {
  triggers: [
    { subtype: 'contact_added_to_list',     nodeType: 'trigger', label: 'Contact added to a list',        group: 'Contacts' },
    { subtype: 'contact_removed_from_list', nodeType: 'trigger', label: 'Contact removed from a list',   group: 'Contacts' },
    { subtype: 'contact_matches_filter',    nodeType: 'trigger', label: 'Contact matches custom filters', group: 'Contacts' },
    { subtype: 'contact_in_segment',        nodeType: 'trigger', label: 'Contact is in a segment',        group: 'Contacts' },
    { subtype: 'anniversary',               nodeType: 'trigger', label: 'Anniversary',                    group: 'Contacts' },
    { subtype: 'form_submitted',            nodeType: 'trigger', label: 'Form submitted',                 group: 'Forms'    },
    { subtype: 'email_opened',              nodeType: 'trigger', label: 'Email opened',                   group: 'Email'    },
    { subtype: 'link_clicked',              nodeType: 'trigger', label: 'Link clicked in an email',       group: 'Email'    },
    { subtype: 'unsubscribed',              nodeType: 'trigger', label: 'Unsubscribed from emails',       group: 'Email'    },
    { subtype: 'webpage_visited',           nodeType: 'trigger', label: 'Webpage visited',                group: 'Website'  },
    { subtype: 'custom_event',              nodeType: 'trigger', label: 'Custom event',                   group: 'Custom'   },
  ],
  actions: [
    { subtype: 'send_email',        nodeType: 'action', label: 'Send an email',               group: 'Messaging' },
    { subtype: 'notify_email',      nodeType: 'action', label: 'Notify by email',              group: 'Messaging' },
    { subtype: 'call_webhook',      nodeType: 'action', label: 'Call a webhook',               group: 'Webhooks'  },
    { subtype: 'add_to_list',       nodeType: 'action', label: 'Add contact to a list',        group: 'Contacts'  },
    { subtype: 'remove_from_list',  nodeType: 'action', label: 'Remove contact from a list',  group: 'Contacts'  },
    { subtype: 'update_contact',    nodeType: 'action', label: 'Update contact attribute',     group: 'Contacts'  },
    { subtype: 'blocklist_contact', nodeType: 'action', label: 'Blocklist contact',            group: 'Contacts'  },
    { subtype: 'assign_user',       nodeType: 'action', label: 'Assign a user to a contact',  group: 'Contacts'  },
    { subtype: 'delete_contact',    nodeType: 'action', label: 'Delete a contact',             group: 'Contacts'  },
  ],
  rules: [
    { subtype: 'delay',             nodeType: 'delay',           label: 'Time delay',                    group: '' },
    { subtype: 'conditional_split', nodeType: 'conditionalSplit', label: 'Conditional split',            group: '' },
    { subtype: 'percentage_split',  nodeType: 'percentageSplit',  label: 'Percentage split',             group: '' },
    { subtype: 'wait_for_event',    nodeType: 'waitForEvent',     label: 'Wait until an event happens',  group: '' },
    { subtype: 'exit',              nodeType: 'exit',             label: 'Exit',                         group: '' },
  ],
};
