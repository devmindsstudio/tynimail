# Contact Added to List

Fires whenever a contact gets added to a specific list. Works for both manual additions and imports.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `listId` | string (UUID) | Yes | The list to watch |
| `filters` | object | No | Extra conditions the contact must also match |

## How it works

The event is emitted from the list service whenever a contact is assigned to a list. The trigger bridge picks it up and enqueues it to the trigger queue. The worker then checks which active workflows have this trigger configured for that specific list and fires them.

If `filters` is set, the contact must match those conditions on top of being added to the list. Contacts that don't pass the filter are silently skipped.

## Things to know

- Fires once per add. If a contact is removed and re-added later, it fires again.
- Works for bulk imports too — each contact in the import gets its own trigger evaluation.
- If you leave `listId` null in the config, the workflow won't match anything. Always set a list.
