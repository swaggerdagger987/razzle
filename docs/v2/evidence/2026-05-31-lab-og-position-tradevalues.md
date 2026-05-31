# Evidence — Lab L5 trade values OG position filter

**Date:** 2026-05-31  
**Slice:** `lab-og-position-tradevalues-prospects` (trade values atom)  
**Cycle:** 96

## Acceptance

```text
npm run build --workspace=apps/web          → exit 0
JWT_SECRET=test pytest apps/api/tests -q    → 51 passed, 5 skipped
```

## Change

- `TradeValuesRenderer.tsx` — `LabOgExportLink` passes `position={position || undefined}` (matches Prospects pattern).

## Gate C (OG)

```text
curl tradevalues?position=WR → 200 51115B PNG
curl tradevalues (no filter)  → 200 62488B PNG
```

## Verdict

PASS — export link scopes OG fetch to active position tab.
