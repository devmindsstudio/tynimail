# Delete Contact

Permanently deletes the contact from the system. This is irreversible.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `confirmed` | boolean | Yes | Must be `true` — acts as a safety check |

## How it works

Deletes the contact row from `tbl_subscribers`. Due to cascade constraints, all related data (list memberships, event history, sent emails FK references) is also cleaned up.

## Things to know

- There is no soft delete. Once this runs, the contact is gone.
- The current execution continues (the steps after this node still run) but they'll have no contact to operate on — any subsequent actions that need a contact ID will fail or no-op gracefully.
- Only use this at the very end of a workflow, and only when you're certain you want the data gone. Common use case is a GDPR right-to-erasure flow.
- `confirmed: false` causes the step to be skipped as a safeguard against misconfiguration.
