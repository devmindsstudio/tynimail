# Webpage Visited

Fires when a contact visits a page on your website. Relies on the tracking script being installed.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `websiteFilters` | object | Yes | URL conditions — which pages count |
| `filters` | object | No | Additional contact attribute conditions |

### websiteFilters format

```json
{
  "conditions": [
    { "value": "/pricing", "operator": "contains" }
  ]
}
```

Supported operators: `contains`, `is_exactly`, `starts_with`, `ends_with`.

If `conditions` is empty, any page visit fires the trigger.

## How it works

The tracking script on your site sends a `POST /t/pageview` request on each page load. The server looks up the contact by email (stored in localStorage from a previous identify call), records the page view in `tbl_page_views`, and emits a `webpage.visited` event. The trigger bridge queues it as `webpage_visited`. The worker evaluates the URL conditions before creating the execution.

## Things to know

- The contact must be identified (via `tynimail.identify()`) for page views to be attributed. Anonymous visits are tracked in the DB but won't fire workflows.
- URL matching is against the full path + query string sent by the tracker. Keep your conditions simple — `contains "/pricing"` is usually enough.
- If you have a high-traffic site, this can generate a lot of trigger queue jobs. Be intentional about which pages you configure workflows for.

## Setup required

The tracking script must be installed on your site:
```html
<script src="https://your-domain.com/t/tracker.js?id=YOUR_SITE_ID"></script>
```
And contacts must call `tynimail.identify({ email: "user@example.com" })` after login.
