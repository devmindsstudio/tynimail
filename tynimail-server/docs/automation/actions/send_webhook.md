# Call a Webhook

Makes an HTTP POST request to an external URL. Use this to connect workflows to your own systems, Zapier, Make, or any other service.

## Config

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | string | Yes | The endpoint to POST to |
| `includeContactDetails` | boolean | No | Attach the full contact object in the payload |
| `includeTriggerEvent` | boolean | No | Attach the trigger event data (event name, properties) |

## Payload format

```json
{
  "workflowId": "...",
  "executionId": "...",
  "contact": { ... },        // if includeContactDetails = true
  "triggerEvent": { ... }    // if includeTriggerEvent = true
}
```

## How it works

The action executor makes a POST request to the configured URL. It waits for a 2xx response. If the request times out or returns a non-2xx status, the step is marked as failed.

## Things to know

- Timeouts are set to a few seconds. If your endpoint is slow, it may cause the execution step to fail. Make your webhook handler fast — just accept the payload and process it async.
- No retry logic on the webhook call itself. If it fails, the execution log records the failure and moves on (or stops, depending on the workflow).
- If you need to pass custom data, use `includeTriggerEvent` and put your data in the custom event properties when triggering the workflow.
