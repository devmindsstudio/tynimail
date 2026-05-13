# Percentage Split

Randomly distributes contacts across branches by percentage. Good for A/B testing emails or flows.

## Config

```json
{
  "branches": [
    { "id": "branch_a", "name": "Branch A", "percentage": 50 },
    { "id": "branch_b", "name": "Branch B", "percentage": 50 }
  ]
}
```

Percentages should add up to 100. You can have more than two branches.

## How it works

When the execution hits this node, it generates a random number and uses the branch percentages as cumulative thresholds to pick a branch. The selected branch ID is written to the execution log, and the engine follows the corresponding edge.

## Things to know

- The split is random per contact, not guaranteed to distribute evenly across small samples. With 50/50 you might get 60/40 in practice with a small audience — that's expected.
- There's no way to "lock" a contact to a branch across multiple workflow runs. Each time they hit the split node, they're randomly assigned again.
- Percentages don't have to be equal — 80/20 or 70/15/15 both work fine.
- The branch taken is recorded in `tbl_execution_logs` under `branch_taken` so you can analyse which branch each contact went through.
