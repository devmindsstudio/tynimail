# Tracking Endpoints

All tracking endpoints live under `/t`. They're all public — no auth header. The `siteId` (UUID) is the only identifier.

---

## GET /t/js

Serves the JS tracker snippet with your `siteId` baked in.

**Query params:**

| Param | Required | Notes |
|-------|----------|-------|
| `siteId` | Yes | UUID v4 — must be a valid UUID or you get `400 // Invalid siteId` |

**Response:** `application/javascript`, `Cache-Control: public, max-age=3600`

What gets baked in:
- Your `siteId`
- The four endpoint URLs (constructed from `APP_URL` env var)
- Whether element tracking is enabled — the click listener is only included if `element_tracking_enabled` is true on your account

This endpoint does a DB lookup on every request (to fetch `element_tracking_enabled`), but then the resulting JS is cached for an hour by the browser.

---

## POST /t/w

Tracks a page view. Called automatically by the snippet on every page load.

**Body:**

```json
{
  "siteId": "uuid",
  "visitorId": "v-abc123...",
  "contactId": "uuid or omit",
  "email": "user@example.com or omit",
  "url": "https://example.com/pricing",
  "path": "/pricing",
  "title": "Pricing – Example",
  "referrer": "https://google.com"
}
```

**Response:** `204 No Content`

**What happens:**
1. Looks up the user by `siteId` — must have `tracking_enabled: true`
2. Tries to resolve a contact: first by `contactId`, then by `email` lookup
3. Inserts a row into `tbl_page_views`
4. If a contact was resolved, emits `webpage.visited` into EventEmitter2 which triggers any `webpage_visited` workflows

Anonymous visits (no contact resolved) are still saved to `tbl_page_views` but don't trigger workflows.

---

## POST /t/e

Tracks a custom event. Called by `TyniMail.push(['track', ...])`.

**Body:**

```json
{
  "siteId": "uuid",
  "event_name": "purchase_completed",
  "properties": {
    "email": "user@example.com",
    "FIRSTNAME": "Jane",
    "plan": "pro"
  },
  "event_data": {
    "order_id": "ord_123"
  }
}
```

**Response:** `204 No Content`

**What happens:**
1. Resolves the user from `siteId`
2. Requires `properties.email` — returns early if missing
3. Upserts the contact by email. If they don't exist, creates them with `source: 'single_import'`. If they do exist, fills in `first_name`/`last_name` only if currently null.
4. Merges `event_data` + remaining properties (after stripping `email`, `FIRSTNAME`, `LASTNAME`) into final event properties
5. Inserts into `tbl_custom_events`
6. Emits `custom_event.<event_name>` via EventEmitter2

The `email`, `FIRSTNAME`, `LASTNAME` fields in properties are contact-level fields — they're used for the upsert and then stripped from the stored event properties.

---

## POST /t/identify

Resolves an email address to a contact UUID for the given `siteId`. Called by `TyniMail.identify(email)`.

**Body:**

```json
{
  "siteId": "uuid",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "contactId": "uuid"
}
```

Returns `{ contactId: null }` if the contact doesn't exist or tracking isn't enabled. The tracker stores the returned `contactId` in localStorage so all subsequent events are attributed to the contact.

This is the only tracking endpoint that returns a meaningful body. Everything else is 204.

---

## POST /t/click

Tracks an element click. Called automatically by the snippet's click listener (only when element tracking is enabled).

**Body:**

```json
{
  "siteId": "uuid",
  "visitorId": "v-abc123...",
  "email": "user@example.com",
  "tag": "BUTTON",
  "id": "add-to-cart",
  "classes": ["btn", "btn-primary"],
  "text": "Add to cart",
  "href": null,
  "attrs": {
    "data-product-id": "prod_456"
  },
  "path": "/products/widget",
  "url": "https://example.com/products/widget"
}
```

**Response:** `204 No Content`

**What happens:**
1. Resolves user from `siteId` — checks `element_tracking_enabled`
2. Resolves contact from `email` — drops silently if no contact found
3. Loads all enabled element rules for the user
4. Evaluates each rule's conditions against the click data (see [element-rules.md](element-rules.md))
5. For each matching rule: inserts `tbl_custom_events` row, emits `custom_event.<event_name>` with full element data attached

The event emitted includes `_element` (the raw click data) and `_rule` (which rule fired). These show up in the execution log when a workflow is triggered.

---

## Notes on all endpoints

- All POST endpoints respond before processing. `trackWebpage`, `trackEvent`, and `trackClick` are fire-and-forget — the response goes out first, then the async work happens.
- `/t/identify` is the exception — it awaits the DB lookup before responding, since the tracker needs the `contactId` to store it.
- Errors in processing are caught and logged as warnings — they never surface to the caller.
- `APP_URL` must be set in `.env`. Without it, the endpoint URLs baked into the tracker JS will be relative paths, which breaks cross-domain tracking.
