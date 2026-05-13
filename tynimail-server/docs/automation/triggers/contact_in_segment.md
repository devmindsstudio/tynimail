# Contact in Segment

Fires when a contact becomes a member of a specific segment. Like `contact_matches_filter`, this runs on a schedule rather than in real-time.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `segmentId` | string (UUID) | Yes | The segment to watch |
| `entryTime` | string | No | Time of day to run, e.g. `"09:00"` |
| `timezone` | string | No | Timezone for `entryTime` |

## How it works

The cron job checks segment membership daily. Contacts that are in the segment and haven't yet entered this workflow get queued up.

## Things to know

- Segments are dynamic — membership can change as contact data changes. This trigger only fires on the first entry, not every time a contact re-enters a segment.
- Pair this with a `conditional_split` inside the workflow if you want to handle contacts differently based on their current state at the time of execution.
