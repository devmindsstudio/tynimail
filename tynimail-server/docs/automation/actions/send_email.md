# Send Email

Sends a transactional email to the contact using a template. The main email action.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `templateId` | string (UUID) | Yes | The email template to use |
| `subject` | string | Yes | Email subject line |
| `fromEmail` | string | Yes | Sender email address |
| `fromName` | string | No | Sender display name |
| `replyTo` | string | No | Reply-to address |
| `previewText` | string | No | The preview text shown in the inbox |

## How it works

The action executor calls Postmark's send API. On success, it saves a record to `tbl_sent_emails` with the `postmark_message_id` returned by Postmark. This message ID is what makes email event tracking (opens, clicks) work downstream.

If Postmark returns an error, the step is marked as failed in the execution log.

## Things to know

- The sender email must be verified in the system (via Settings > Sender Emails) before it can be used here.
- Template variables are merged at send time using the contact's attributes. Make sure your template handles missing variables gracefully.
- The `postmark_message_id` saved here is what links back to `tbl_email_events` when Postmark fires open/click webhooks. Without it, email-based triggers won't work for this send.
- Hard-bounced contacts are skipped — the executor checks `hard_bounce` on the subscriber before sending.
