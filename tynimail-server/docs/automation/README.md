# Automation Engine

This covers how the workflow automation system works — triggers, actions, and rules. Each node type has its own doc.

## Triggers

What starts a workflow. A workflow has exactly one trigger node.

| Trigger | File | Notes |
|---------|------|-------|
| Contact added to list | [triggers/contact_added_to_list.md](triggers/contact_added_to_list.md) | Real-time |
| Contact removed from list | [triggers/contact_removed_from_list.md](triggers/contact_removed_from_list.md) | Real-time |
| Contact matches filter | [triggers/contact_matches_filter.md](triggers/contact_matches_filter.md) | Daily cron |
| Contact in segment | [triggers/contact_in_segment.md](triggers/contact_in_segment.md) | Daily cron |
| Anniversary | [triggers/anniversary.md](triggers/anniversary.md) | Daily cron |
| Manual entry | [triggers/manual_entry.md](triggers/manual_entry.md) | API-triggered |
| Form submitted | [triggers/form_submitted.md](triggers/form_submitted.md) | Real-time |
| Email opened | [triggers/email_opened.md](triggers/email_opened.md) | Postmark webhook |
| Link clicked | [triggers/link_clicked.md](triggers/link_clicked.md) | Postmark webhook |
| Unsubscribed | [triggers/unsubscribed.md](triggers/unsubscribed.md) | Postmark webhook |
| Custom event | [triggers/custom_event.md](triggers/custom_event.md) | Real-time, supports element tracking |
| Webpage visited | [triggers/webpage_visited.md](triggers/webpage_visited.md) | Real-time via tracker JS |

## Actions

What happens to the contact at each step.

| Action | File |
|--------|------|
| Send email | [actions/send_email.md](actions/send_email.md) |
| Notify by email | [actions/notify_email.md](actions/notify_email.md) |
| Call a webhook | [actions/send_webhook.md](actions/send_webhook.md) |
| Add to list | [actions/add_to_list.md](actions/add_to_list.md) |
| Remove from list | [actions/remove_from_list.md](actions/remove_from_list.md) |
| Update contact | [actions/update_contact.md](actions/update_contact.md) |
| Blocklist contact | [actions/blocklist_contact.md](actions/blocklist_contact.md) |
| Assign user | [actions/assign_user.md](actions/assign_user.md) |
| Delete contact | [actions/delete_contact.md](actions/delete_contact.md) |

## Rules

Flow control nodes — they don't act on the contact directly, they control how the workflow progresses.

| Rule | File |
|------|------|
| Delay | [rules/delay.md](rules/delay.md) |
| Conditional split | [rules/conditional_split.md](rules/conditional_split.md) |
| Percentage split | [rules/percentage_split.md](rules/percentage_split.md) |
| Wait for event | [rules/wait_for_event.md](rules/wait_for_event.md) |

## Tracking

The JS tracking system that feeds the `webpage_visited` and `custom_event` triggers.

| File | What it covers |
|------|---------------|
| [tracking/README.md](tracking/README.md) | Overview and key constraints |
| [tracking/tracker-script.md](tracking/tracker-script.md) | Script installation, `identify()`, `push()`, queuing |
| [tracking/element-rules.md](tracking/element-rules.md) | Click-to-event rules — conditions, properties, how they work |
| [tracking/endpoints.md](tracking/endpoints.md) | All `/t/*` endpoints with request/response details |
| [tracking/setup.md](tracking/setup.md) | Site ID generation, enabling flags, env vars |

## How the engine works (short version)

1. An event happens → `TriggerEventBridgeService` picks it up and enqueues to `trigger-queue`
2. `TriggerWorker` finds matching active workflows, evaluates filters, creates an execution record, enqueues to `execution-queue`
3. `ExecutionWorker` calls `ExecutionEngineService.executeWorkflow()` which walks the DAG node by node
4. Each node is logged to `tbl_execution_logs`
5. Delay nodes re-enqueue with BullMQ delay. Wait-for-event nodes park the execution in `tbl_event_waiters`

All queue workers are stateless and Redis is the shared state, so horizontal scaling works out of the box.
