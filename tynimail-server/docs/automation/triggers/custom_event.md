# Custom Event

Fires when your app or website emits a named custom event. The most flexible trigger — you define what "the event" means.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `eventName` | string | Yes | The event name to listen for, e.g. `purchase_completed` |
| `filters` | object | No | Additional contact conditions |

## How it works

Custom events can come from two sources:

**1. Direct API / server-side**
Your backend calls the track event endpoint, passing the event name, contact email, and any properties. The system looks up the contact, records the event in `tbl_custom_events`, and emits it into the pipeline.

**2. Element tracking (auto-captured)**
When element tracking is enabled for a site, the tracker JS sends a `POST /t/click` for every click on the page. The `ClickProcessingService` evaluates the click against all enabled element tracking rules. If a rule matches, it emits a `custom_event.<eventName>` — the event name comes from the rule's config.

In both cases, the `TriggerEventBridgeService` picks up the `custom_event.*` event and enqueues it to the trigger queue. The worker matches it against workflows by `eventName`.

## Element tracking rules

When the custom event trigger is configured in the workflow builder, you'll see an "Element Tracking Rules" section below the event name field. Rules let you define which clicks should fire this event.

Each rule has:
- **Conditions** — which element to match (by tag, ID, CSS class, text, href, page path, URL, or data attribute). All conditions must pass (AND logic).
- **Static properties** — fixed key/value pairs added to the event properties.
- **Dynamic properties** — values pulled from the clicked element at click time (e.g. the value of `data-plan` attribute).

Rules are stored in `tbl_element_rules` and evaluated server-side on every click. Only enabled rules are checked.

## Event properties

Properties from the event are available in the execution context. When triggered by element tracking, the execution log's trigger step also includes:

- `_element` — details of the clicked element (tag, id, classes, text, href, path, url, data attributes)
- `_rule` — which rule matched (id and name)

## Things to know

- The `eventName` comparison is case-sensitive. `Purchase_Completed` and `purchase_completed` are different events.
- You can have multiple workflows listening for the same event name — all of them fire.
- Element tracking requires the tracking script to be installed on the site and "Element click tracking" toggled on in Settings > Integrations.
