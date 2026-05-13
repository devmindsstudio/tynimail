# Notify by Email

Sends an internal notification email — not to the contact, but to someone on your team (or any address you specify). Use this to alert your team when something important happens.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sender` | object | Yes | `{ email, name }` — who the notification comes from |
| `recipientType` | string | Yes | `specific` (hardcoded addresses) or `attribute` (pull from contact attribute) |
| `recipients` | string[] | If `specific` | List of email addresses to notify |
| `recipientAttribute` | string | If `attribute` | The contact attribute that holds the recipient email |
| `subject` | string | Yes | Notification subject |
| `body` | string | Yes | Notification body (plain text or HTML) |

## How it works

Builds the email internally and sends via Postmark. Unlike `send_email`, this does **not** create a `tbl_sent_emails` record — it's a pure notification, not a tracked marketing send.

## Things to know

- `recipientType: attribute` is useful when you've assigned a team member to a contact and want to notify that specific person.
- There's no open/click tracking on notification emails. They're fire-and-forget.
- Keep the body short. This is for internal alerts, not newsletters.
