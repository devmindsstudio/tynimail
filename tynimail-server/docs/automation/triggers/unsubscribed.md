# Unsubscribed from Emails

Fires when a contact unsubscribes. Postmark sends a `SubscriptionChange` webhook when this happens.

## Config

No additional config. The trigger fires for any unsubscribe event for contacts belonging to the workflow owner.

## How it works

Postmark fires a `SubscriptionChange` webhook when a contact clicks an unsubscribe link. The webhook service records this as an `unsubscribed` event in `tbl_email_events` and emits `email.unsubscribed`. The trigger bridge handler does two things:

1. Sets the contact's `status = 0` in `tbl_subscribers` (marking them as unsubscribed)
2. Enqueues the trigger as `unsubscribed` so any matching workflows fire

## Things to know

- The status update (marking contact as unsubscribed) happens in the trigger bridge, before the workflow even executes. So by the time your workflow's actions run, the contact is already marked unsubscribed.
- Typical use case: send a "sorry to see you go" email, remove them from all lists, or notify your team.
- Don't send heavy marketing emails in a workflow triggered by unsubscribe — they're already out. Keep it to a simple confirmation or offboarding message.

## Setup required

Postmark webhook URL must be configured. Select `SubscriptionChange` as a webhook event in Postmark's dashboard.
