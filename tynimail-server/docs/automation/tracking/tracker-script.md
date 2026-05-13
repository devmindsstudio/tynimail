# Tracker Script

The JS snippet that runs on your customers' websites. It handles page views, contact identification, custom event tracking, and (optionally) element click tracking.

## Installation

Add this to every page you want to track, ideally just before `</body>`:

```html
<script src="https://your-app.com/t/js?siteId=YOUR_SITE_ID" async></script>
```

The `siteId` is a UUID — you generate it once from the dashboard (Settings → Tracking). The script is served with a 1-hour cache header so repeat visitors don't re-download it on every page.

## What happens on load

As soon as the script loads:

1. It generates (or reads from localStorage) an anonymous visitor ID — a random string prefixed with `v-`, stored under the key `tm_vid_<siteId>`.
2. It fires a page view to `/t/w` with the visitor ID, current URL, path, title, and referrer.
3. If a contact ID was previously stored (from a past `identify()` call), it's included in the page view.

## localStorage keys

The snippet uses three localStorage keys, all namespaced by siteId to avoid collisions across multiple TyniMail installations on the same domain:

| Key | What it stores |
|-----|---------------|
| `tm_vid_<siteId>` | Anonymous visitor ID, generated once and persists forever |
| `tm_cid_<siteId>` | Contact UUID, written when `identify()` resolves |
| `tm_email_<siteId>` | Email address, written when `identify()` is called |

## Identifying a contact

Call this when you know who the visitor is — after they log in, submit a form, etc.:

```js
TyniMail.identify('user@example.com');
```

What happens:
1. The email is stored in localStorage and sent to `/t/identify`
2. The server looks up the contact under your account by email
3. If found, returns the contact UUID, which is then stored in localStorage
4. All subsequent page views and events from this browser will include the contactId

If the contact doesn't exist in your TyniMail account yet, the call still succeeds (returns `null`) and the browser won't have a contactId until you create or import the contact.

## Tracking custom events

```js
TyniMail.push(['track', 'purchase_completed', { plan: 'pro' }, { order_id: '123' }]);
```

Arguments:
1. `'track'` — command name (only this command exists right now)
2. Event name — matches the `eventName` in your `custom_event` trigger config
3. Properties — merged with `event_data`, available in the execution log. Can include `email`, `FIRSTNAME`, `LASTNAME` which are used for contact upsert.
4. Event data — additional data merged into properties (optional)

If `properties.email` is present, the event upserts the contact. That means you can fire a `track` call with an email before calling `identify()` and the contact will be created.

## Queuing before the script loads

If you fire `TyniMail.push()` before the script has loaded (e.g. from inline JS), that works too. The snippet checks `window.TyniMail._q` on init and replays any queued commands:

```html
<script>
  window.TyniMail = window.TyniMail || { _q: [] };
  window.TyniMail._q.push(['track', 'page_intent', { section: 'pricing' }]);
</script>
<script src="https://your-app.com/t/js?siteId=..." async></script>
```

## Element click tracking

If `element_tracking_enabled` is on for your account, the script includes a click listener that fires to `/t/click` on every click. You define rules in the dashboard (Automations → Element Tracking) that match elements by tag, ID, class, text, href, path, URL, or custom `data-` attributes.

When a click matches a rule, a `custom_event` is emitted with the configured event name — exactly as if you'd called `TyniMail.push(['track', 'your_event_name'])`. The execution log will include the matched element details under `_element` and the rule that fired under `_rule`.

Client-side deduplication: if the exact same element is clicked within 500ms (e.g. a double-click), only the first click is sent. The server does no additional deduplication.

See [element-rules.md](element-rules.md) for how rules work.

## POST fallback

The snippet uses `fetch` with `keepalive: true` as the default. This ensures tracking fires even if the call happens during page unload. If `fetch` is unavailable (old browser), it falls back to a basic `XMLHttpRequest`. Both paths are fire-and-forget — errors are swallowed so tracking never breaks the page.
