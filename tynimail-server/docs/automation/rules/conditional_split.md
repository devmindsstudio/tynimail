# Conditional Split

Branches the workflow based on whether the contact matches a set of conditions. Think of it as an if/else.

## Config

```json
{
  "branches": [
    {
      "id": "branch_a",
      "name": "Branch A",
      "isFallback": false,
      "conditions": { ... }
    },
    {
      "id": "branch_b",
      "name": "Branch B (fallback)",
      "isFallback": true,
      "conditions": null
    }
  ]
}
```

You can have more than two branches. Exactly one must have `isFallback: true`.

## How it works

The execution engine evaluates each non-fallback branch in order. The first branch whose conditions pass is the one taken. If none match, the fallback branch is used.

The edge leaving the conditional split node uses `sourceHandle` to identify which branch it belongs to — `branch_a`, `branch_b`, etc. The engine follows the edge matching the winning branch ID.

## Things to know

- Conditions are evaluated against the contact's current attributes at execution time, not at trigger time. If you have a delay before the split, the contact's data might have changed.
- Branches are evaluated top-to-bottom. Order matters if multiple branches could match the same contact.
- The fallback branch always fires if nothing else matches. Don't remove it.
- If a branch has no outgoing edge in the canvas, the execution simply ends at that branch (no error).
