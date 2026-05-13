# Wait for Event

Pauses the execution and waits for a specific event to happen. If the event occurs within the timeout window, the workflow continues down the "yes" branch. If time runs out first, it goes down the "no" branch.

## Config

| Field | Type | Notes |
|-------|------|-------|
| `eventType` | string | The event to wait for, e.g. `email_opened`, `custom_event` |
| `eventConfig` | object | Event-specific config (e.g. `{ eventName: "purchase_completed" }` for custom_event) |
| `waitTime` | object | `{ months, days, hours, minutes }` — how long to wait before timing out |

## How it works

When the engine hits a wait-for-event node:

1. A row is inserted into `tbl_event_waiters` with the execution ID, contact ID, event type, and a calculated expiry time.
2. A timeout job is enqueued to BullMQ with a delay matching `waitTime`. The BullMQ job ID is saved to the waiter row.
3. The execution is parked — status set to `waiting_for_event`.

When the awaited event fires for this contact:
- The `EventWaiterWorker` finds the matching waiter row, cancels the timeout job, and re-enqueues the execution to resume down the `yes` branch.

When the timeout job fires (event never came):
- The execution is resumed down the `no` branch.

## Things to know

- You can wait for: `email_opened`, `email_clicked`, `custom_event`, `form_submitted`, and others. The `eventType` must match the trigger type string used in the queue.
- For `custom_event`, set `eventConfig.eventName` to the specific event name you're waiting for.
- The `yes`/`no` branch edges on the canvas use `sourceHandle: "yes"` and `sourceHandle: "no"` respectively. If you don't draw a `no` branch, timeouts just end the execution silently.
- Timeout precision is BullMQ-level (milliseconds). A 3-day wait is accurate to the second.
- If the same event fires multiple times while the execution is parked (e.g. contact opens the email twice), only the first occurrence resolves the waiter. Subsequent fires are ignored.
