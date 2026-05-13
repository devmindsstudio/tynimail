# Element Rules

Element rules let you turn clicks on specific HTML elements into custom events, without writing any extra JS. You define a rule in the dashboard, and when the click tracking JS detects a matching click, it fires the event automatically.

## How to create a rule

Go to Automations → Element Tracking (or configure them inside a `custom_event` trigger node in the workflow builder). Each rule has:

- **Event name** — the custom event this rule fires. Must match the `eventName` in your `custom_event` trigger config.
- **Rule name** — optional human-readable label.
- **Conditions** — what the clicked element must look like (see below).
- **Properties** — what data to attach to the fired event.
- **Enabled toggle** — disable without deleting.

## Conditions

Every condition in a rule must match for the rule to fire (AND logic). You can add as many conditions as you need.

| Field | What it matches |
|-------|----------------|
| `tag` | HTML tag name (`button`, `a`, `div`, etc.) |
| `id` | Element `id` attribute |
| `class` | Space-joined list of element classes |
| `text` | Visible inner text of the element |
| `href` | `href` attribute (for links) |
| `path` | URL path of the page where the click happened |
| `url` | Full URL of the page |
| `attr` | Value of a specific `data-*` attribute |

For `attr`, you also specify which attribute name to check (e.g. `data-product-id`).

### Operators

| Operator | Behaviour |
|----------|----------|
| `is` | Exact match (case-insensitive) |
| `is_not` | Anything except this value |
| `contains` | Value appears anywhere in the field |
| `does_not_contain` | Value does not appear in the field |
| `starts_with` | Field starts with this string |
| `exists` | Field has any non-empty value |

## Properties

Properties are data that gets attached to the event and stored in `tbl_custom_events`. Two types:

**Static** — you write the key and value directly. Same value every time the rule fires.

**Dynamic** — value is pulled from the clicked element at click time.

| Source | What you get |
|--------|-------------|
| `attr` | Value of the specified `data-*` attribute |
| `text` | Inner text of the element (trimmed, max 200 chars) |
| `href` | `href` attribute value |
| `id` | `id` attribute value |
| `class` | Space-joined class list |

Example: a rule for add-to-cart clicks that captures the product ID from `data-product-id`:
- Condition: tag `is` `button`, class `contains` `add-to-cart`
- Dynamic property: key `product_id`, source `attr`, attr `data-product-id`

## How it works end-to-end

1. Visitor clicks something on the page
2. The click listener collects: tag, id, classes, text (max 200 chars), href, `data-*` attrs, path, URL
3. Everything is sent to `POST /t/click` with the visitor's email (from localStorage)
4. `ClickProcessingService` loads all enabled rules for the account, evaluates each one's conditions against the click data
5. For every matching rule, it inserts a row into `tbl_custom_events` and emits `custom_event.<event_name>` via EventEmitter2
6. `TriggerEventBridgeService` picks that up and enqueues it to the trigger queue, where active workflows with a matching `custom_event` trigger are started

If multiple rules match the same click, all of them fire. Each rule's event goes through independently.

## API for managing rules

These are authenticated endpoints (Bearer token required):

| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/element-rules` | List all rules. Optional `?event=name` to filter by event name. |
| `POST` | `/element-rules` | Create a rule |
| `PATCH` | `/element-rules/:id` | Update a rule (partial) |
| `PATCH` | `/element-rules/:id/toggle` | Enable or disable (`{ enabled: true/false }`) |
| `DELETE` | `/element-rules/:id` | Delete a rule |

## Things to know

- Element tracking only runs if `element_tracking_enabled` is true on your account. If it's off, the click listener is not included in the JS at all — it's baked at serve time.
- A contact must be identified (email in localStorage) for click events to fire triggers. If the visitor is anonymous, the click is processed but silently dropped when no contact can be resolved.
- The 500ms client-side dedup prevents double-firing from slow double-clicks on the same element. But if a user clicks two different elements that both match the same rule, both fire.
- Conditions are evaluated server-side, not in the browser. The browser sends everything about every click; the server decides what matches.
