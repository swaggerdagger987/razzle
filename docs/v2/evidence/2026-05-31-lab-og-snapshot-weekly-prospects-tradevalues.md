# Evidence — Lab L5 OG snapshot rows (weekly, prospects, tradevalues)

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-weekly-prospects-tradevalues`  
**Verdict:** PASS

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Gate C — OG PNG

Snapshot param (encoded top rows):

```
weekly snap: 200 47650
prospects snap: 200 45150
weekly live (no snapshot): 200 53320
```

All PNG ≥40KB. Snapshot cards render encoded player names (Ja'Marr Chase test row).

## Files

- `WeeklyHeatmapRenderer.tsx` — top-6 by PPG → `snapshotRows` + `position`
- `ProspectsRenderer.tsx` — top-6 prospects by RPS → `snapshotRows`
- `TradeValuesRenderer.tsx` — top-6 by trade value / formula → `snapshotRows`

## Trust

- T5 — export matches visible panel rows
- T6 — screenshot-worthy OG cards for Reddit Lab shares
