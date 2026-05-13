# Contact Removed from List

Fires when a contact is removed from a specific list.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `listId` | string (UUID) | Yes | The list to watch |
| `filters` | object | No | Extra conditions the contact must also match |

## How it works

Same pipeline as `contact_added_to_list` but on the removal side. The list service emits a `contact.removed_from_list` event, the bridge queues it, and the worker matches it against active workflows.

## Things to know

- Useful for win-back flows — if someone unsubscribes from your newsletter list, you might want to kick off a re-engagement workflow.
- Filters apply at trigger time, so they're evaluated against the contact's current attributes (which might have changed since they were on the list).
