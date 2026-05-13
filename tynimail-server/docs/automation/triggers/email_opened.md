# Email Opened

Fires when a contact opens an email sent through the system. Powered by Postmark's Open webhook.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `campaignId` | string | No | If set, only fires for emails tied to that campaign |

## How it works

Postmark sends an `Open` webhook to `/postmark/webhook`. The webhook service looks up the sent email by `postmark_message_id`, records the open event in `tbl_email_events`, increments `open_count` on `tbl_sent_emails`, and emits an `email.opened` event. The trigger bridge queues it as `email_opened`.

## Things to know

- **Apple Mail Privacy Protection (MPP)**: Apple pre-fetches emails in some cases, which registers as an open even if the user never actually read it. The `is_apple_privacy` flag in `tbl_email_events` is set when the user agent looks like Apple's prefetch proxy. Be careful using open-based triggers for personalisation decisions — the open rate is inflated on Apple devices.
- For this trigger to work, the email must have been sent through the system (i.e. `postmark_message_id` saved to `tbl_sent_emails`). Emails sent externally won't fire this.
- Multiple opens from the same contact on the same email each fire the trigger separately.

## Setup required

Postmark's webhook URL must be configured in the Postmark dashboard to point at your server:
```
https://your-domain.com/postmark/webhook
```
Select at minimum: Open, Click, Bounce, SpamComplaint, SubscriptionChange.
