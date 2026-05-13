# Tracking

The tracking system lets you observe what contacts do on your website — pages they visit, custom events you fire, and elements they click. This feeds directly into the automation engine: triggers like `webpage_visited` and `custom_event` only fire when the tracker is installed and the contact is identified.

## How it fits together

1. You get a site ID from the dashboard (Settings → Tracking)
2. You drop the script tag on your site — it fetches the JS snippet with your site ID baked in
3. The snippet auto-fires a page view on load, and exposes `TyniMail.identify()` and `TyniMail.push()`
4. If you have element rules set up, clicks on matching elements emit custom events automatically

## Files

| File | What it covers |
|------|---------------|
| [tracker-script.md](tracker-script.md) | The JS snippet — installation, auto page view, `identify()`, `push()` |
| [element-rules.md](element-rules.md) | Element tracking rules — conditions, properties, how clicks become custom events |
| [endpoints.md](endpoints.md) | All public tracking endpoints (`/t/js`, `/t/w`, `/t/e`, `/t/identify`, `/t/click`) |
| [setup.md](setup.md) | Site ID generation, enabling tracking and element tracking per account |

## Key things to know

- **Tracking is opt-in per account.** If `tracking_enabled` is false on the user record, page views and events are silently dropped.
- **Element tracking is a separate flag.** `element_tracking_enabled` must be true for click tracking to work. It's also baked into the JS at serve time — the click listener is only included when this flag is on.
- **Contacts must be identified.** Anonymous visitors (no `identify()` call) are still recorded in `tbl_page_views` but don't fire workflow triggers. The trigger only fires when a `contactId` can be resolved.
- **All tracking endpoints are public** — no auth header needed. The `siteId` is the only key.
- **Fire-and-forget everywhere.** Every POST endpoint responds 204 immediately and processes async. Tracking must never slow down or break a customer's website.
