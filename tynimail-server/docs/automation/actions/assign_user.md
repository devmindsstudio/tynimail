# Assign User to Contact

Assigns a team member to a contact. Useful for sales workflows where a rep should take over after an automation sequence.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `assignmentType` | string | Yes | `specific` or `round_robin` |
| `userId` | string (UUID) | If `specific` | The team member to assign |

## How it works

Sets the `owner_id` field on the contact's record in `tbl_subscribers`. If `round_robin` is selected, the executor cycles through team members in order.

## Things to know

- Once assigned, the team member's ID is just a foreign key on the contact. What you do with that relationship (CRM views, notifications) is up to the rest of the app.
- Pair this with a `notify_email` using `recipientType: attribute` to automatically ping the assigned rep.
- Round-robin assignment state is not persisted between workflow runs — it's based on current team member order in the DB.
