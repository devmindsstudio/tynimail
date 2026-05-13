# Remove Contact from List

Removes the contact from a list. Useful for keeping lists clean as contacts progress through workflows.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `listId` | string (UUID) | Yes | The list to remove the contact from |

## How it works

Deletes the contact's membership row from the junction table. If the contact isn't in the list, it's a silent no-op.

## Things to know

- Same loop warning as `add_to_list` — removing from a list can fire `contact_removed_from_list` triggers.
- Common use case: move contacts between stages by removing from one list and adding to another in sequence.
