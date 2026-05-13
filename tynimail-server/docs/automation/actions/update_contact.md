# Update Contact Attribute

Updates one or more attributes on the contact's profile. Good for tracking lifecycle stages, scores, or any custom data point.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `attributes` | array | Yes | List of `{ field, value }` pairs to update |

```json
{
  "attributes": [
    { "field": "plan", "value": "pro" },
    { "field": "onboarding_complete", "value": "true" }
  ]
}
```

## How it works

The executor iterates through the `attributes` array and applies each update to the contact's record in `tbl_subscribers`. All updates happen in a single DB call.

## Things to know

- Values are stored as strings. If you need a boolean or number, you'll need to handle the casting on the receiving end.
- Updating an attribute that's used in a segment definition will change segment membership, which could trigger other workflows.
- Empty `field` values in the array are skipped.
