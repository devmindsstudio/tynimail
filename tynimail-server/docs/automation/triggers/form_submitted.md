# Form Submitted

Fires when a contact submits a specific form.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `formId` | string (UUID) | Yes | The form to watch |
| `filters` | object | No | Additional contact conditions |

## How it works

The form submission service emits a `form.submitted` event after saving the submission to `tbl_form_submissions`. The trigger bridge picks it up and enqueues it. The worker matches it against workflows configured for that `formId`.

## Things to know

- The contact must already exist in the system for the trigger to fire. Anonymous submissions (no matched contact) are ignored.
- If a contact submits the same form multiple times, each submission fires the trigger independently.
