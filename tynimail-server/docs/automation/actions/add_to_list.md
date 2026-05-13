# Add Contact to List

Adds the contact to a list mid-workflow. Can be used to segment contacts based on their behaviour.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `listId` | string (UUID) | Yes | The list to add the contact to |

## How it works

The executor inserts a row into the subscriber-list junction table. If the contact is already in that list, it's a no-op — no error, no duplicate.

## Things to know

- Adding a contact to a list will fire any active `contact_added_to_list` triggers for that list. Be careful not to create infinite loops (workflow A adds to list, which triggers workflow B, which adds to the same list again).
- If `listId` is null, the step fails with a config error.
