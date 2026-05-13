# Delay

Pauses execution for a set amount of time before continuing to the next node.

## Config

| Field | Type | Notes |
|-------|------|-------|
| `months` | number | Months to wait |
| `days` | number | Days to wait |
| `hours` | number | Hours to wait |
| `minutes` | number | Minutes to wait |

All fields default to 0. At least one should be non-zero.

## How it works

When the execution engine hits a delay node, it calculates the total wait time in milliseconds and re-enqueues the job to BullMQ with a native delay. BullMQ holds the job until the delay expires, then delivers it back to the execution worker which resumes from the next node.

The execution record stays in `running` status during the wait — it's not marked as waiting. The `current_node_id` is updated so the worker knows where to resume if the job is retried.

## Things to know

- Precision is millisecond-level. Much better than the old cron-based approach which had ~1 minute granularity.
- Delays survive server restarts — they're stored in Redis by BullMQ, not in-memory.
- There's no maximum delay enforced at the code level, but very long delays (months) depend on Redis staying healthy. For very long waits, the `wait_for_event` node with a generous timeout might be more appropriate.
- The delay is calculated from when the node is reached, not from when the workflow was triggered.
