# Evidence — lab-tradevalues-og-formula-label (2026-05-31)

## Slice

Trade Values `ogSnapshotRows` use `formula.name` as stat label when a custom formula sort is active.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
```

## Verdict

PASS — export snapshot encodes the same stat label users see on the panel.
