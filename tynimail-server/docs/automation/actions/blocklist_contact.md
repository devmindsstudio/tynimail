# Blocklist Contact

Adds the contact to the blocklist, preventing future emails from being sent to them.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `blockType` | string | Yes | `marketing` or `transactional` |

- `marketing` — blocks marketing emails only. Transactional (receipts, password resets) still go through.
- `transactional` — blocks all email sending to this contact.

## How it works

Inserts a record into `tbl_contact_blocklist`. The send_email executor checks this table before sending and skips the contact if they're blocklisted.

## Things to know

- Blocklisting is permanent until manually removed. There's no expiry.
- Use `marketing` for soft opt-outs. Use `transactional` only when you're sure you should never contact them again (e.g. GDPR deletion request).
- This is separate from the `unsubscribed` status on `tbl_subscribers`. A contact can be unsubscribed but not blocklisted (they opted out of marketing but can still receive a receipt).
