# Setup

Getting tracking working for an account involves two things: generating a site ID and enabling the right flags.

## Site ID

Every account gets one site ID — a UUID that acts as the public key for the tracking endpoints. It's stored in `tbl_users.site_id`.

To generate one:

```
GET /users/generate-site-id
```

Requires a valid auth token. Generates a UUID v4, saves it to the user's row, and returns it. If the user already has a site ID, it returns the existing one (idempotent — calling it multiple times is safe).

Once you have the site ID, install the script:

```html
<script src="https://your-app.com/t/js?siteId=YOUR_SITE_ID" async></script>
```

## Enabling tracking

There are two flags on `tbl_users`:

| Column | What it controls |
|--------|-----------------|
| `tracking_enabled` | Master switch. If false, page views and custom events are silently dropped. |
| `element_tracking_enabled` | Click tracking. If false, the click listener is not included in the JS snippet at all. |

These are separate so you can have page view + custom event tracking without the overhead of click tracking.

When `element_tracking_enabled` changes, the JS snippet will reflect the new value within 1 hour (cache TTL). If you need it to take effect immediately, users can hard-refresh.

## DB tables involved

| Table | Purpose |
|-------|---------|
| `tbl_users` | `site_id`, `tracking_enabled`, `element_tracking_enabled` |
| `tbl_page_views` | One row per page view. Columns: `user_id`, `tracking_id` (visitor ID), `contact_id` (nullable), `url`, `path`, `title`, `referrer`, `viewed_at` |
| `tbl_custom_events` | One row per tracked event. Columns: `user_id`, `contact_id`, `event_name`, `properties` (JSONB), `event_at`, `created_at` |
| `tbl_element_rules` | One row per element tracking rule. Columns: `user_id`, `event_name`, `name`, `conditions` (JSONB), `properties` (JSONB), `enabled`, timestamps |

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `APP_URL` | Yes, for cross-domain tracking | Base URL baked into the tracker JS for the endpoint URLs. Without it, endpoints default to relative paths which only works if the tracker is on the same domain as the API. |

## Quick checklist

- [ ] `site_id` generated for the account
- [ ] `tracking_enabled = true` on the user record
- [ ] Script tag installed on the customer's site with the correct `siteId`
- [ ] `TyniMail.identify(email)` called after login / form submit
- [ ] (optional) `element_tracking_enabled = true` + element rules configured for click-based custom events
- [ ] `APP_URL` set in `.env` if tracking is cross-domain
