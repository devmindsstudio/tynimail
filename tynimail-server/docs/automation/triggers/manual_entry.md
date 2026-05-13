# Manual Entry

Lets you push a specific contact into a workflow on demand via the API. Useful for testing, one-off campaigns, or triggering workflows from external systems.

## Config

No node config needed — there's nothing to configure in the trigger node itself.

## API Usage

```
POST /workflows/manual-entry/:workflowId
Body: { contactId: "uuid" }
```

Requires authentication. The workflow must be in `active` status.

## How it works

The manual entry controller validates the contact belongs to the authenticated user, then directly enqueues the execution to the execution queue — it bypasses the trigger queue entirely since there's no event matching needed.

## Things to know

- The workflow must be active. Trying to manually enter a draft or paused workflow returns an error.
- You can only trigger it for one contact at a time via the API. For bulk manual entry you'd need to call it in a loop.
- Good for testing your workflow end-to-end without having to simulate a real event.
