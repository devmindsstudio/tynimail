# Contact Matches Filter

Fires when a contact first satisfies a custom filter condition. This is a scheduled trigger — it runs on a cron job, not in real-time.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `filters` | object | Yes | The filter conditions to evaluate |
| `entryTime` | string | No | Time of day to run the check, e.g. `"09:00"` |
| `timezone` | string | No | Timezone for `entryTime`, e.g. `"UTC"`, `"America/New_York"` |

## How it works

The cron trigger service runs daily at the configured `entryTime`. It scans all contacts for the workflow's owner and evaluates the filter conditions. Contacts that now match — and haven't already entered this workflow — get enqueued.

## Things to know

- This does **not** fire instantly when a contact's data changes. There's up to a ~24-hour delay depending on when the cron last ran.
- If a contact already entered the workflow before, they won't be re-entered unless the workflow was reset.
- Good for things like "contact has been inactive for 30 days" or "contact's subscription is expiring soon."
