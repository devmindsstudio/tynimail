# Link Clicked in Email

Fires when a contact clicks a tracked link inside an email. Powered by Postmark's Click webhook.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `campaignId` | string | No | If set, only fires for emails tied to that campaign |
| `urlFilter` | string | No | If set, only fires when the clicked URL contains this string |

## How it works

Postmark wraps links in your emails with their tracking redirects. When the contact clicks, Postmark fires a `Click` webhook. The webhook service looks up the sent email by `postmark_message_id`, records the click in `tbl_email_events`, increments `click_count`, and emits an `email.clicked` event. The trigger bridge queues it as `link_clicked`.

The worker checks `urlFilter` — if configured, the clicked link must contain that string (case-insensitive) for the workflow to fire.

## Things to know

- Link tracking must be enabled in Postmark for your sending stream.
- Each click fires a separate event — if a contact clicks multiple links in the same email, each one is processed.
- `urlFilter` is a partial match (contains), so `"/pricing"` would match `"https://yoursite.com/pricing?ref=email"`.

## Setup required

Same as email_opened — Postmark webhook URL must be configured.
