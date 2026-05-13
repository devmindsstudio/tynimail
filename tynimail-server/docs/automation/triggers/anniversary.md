# Anniversary

Fires once a year based on a date stored in the contact's attributes — think birthdays, signup anniversaries, renewal dates.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `dateAttribute` | string | Yes | The contact attribute holding the date, e.g. `"birthday"` |
| `timing` | string | Yes | When to fire relative to the date: `same_day`, `day_before`, `week_before` |
| `offset` | number | No | Additional day offset (positive = after, negative = before) |
| `entryTime` | string | No | Time of day to send, e.g. `"09:00"` |
| `timezone` | string | No | Timezone for `entryTime` |

## How it works

The cron job runs daily and checks all contacts. For each contact, it looks at the value of `dateAttribute`, calculates the target fire date based on `timing` and `offset`, and fires the trigger if today matches.

## Things to know

- The date attribute needs to be stored in a parseable date format (ISO 8601 works). If the attribute is missing or unparseable for a contact, that contact is skipped silently.
- Year of the stored date is ignored — it only cares about month and day.
- Offset is applied after the `timing` adjustment. So `timing: day_before` + `offset: -1` means 2 days before.
