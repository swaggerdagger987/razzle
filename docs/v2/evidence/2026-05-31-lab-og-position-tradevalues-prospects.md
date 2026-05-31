# Evidence — Lab L5 OG position tradevalues + prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`

## Change

- `TradeValuesRenderer`: `LabOgExportLink` now passes `position={position || undefined}` (matches Prospects/Breakouts pattern).
- `ProspectsRenderer`: already forwarded position — verified unchanged.

## Build

- `npm run build --workspace=apps/web` — exit 0

## OG curl (position=WR, demo fallback when API down)

```text
tradevalues 200 51115
prospects 200 49000
```

PNG ≥40KB each; WR-only suffix on card blurb when live filter applied.

## Tests

- `JWT_SECRET=test python3 -m pytest apps/api/tests -q --ignore=apps/api/tests/test_screener_snapshot.py` — 51 passed, 3 skipped (cycle standard)

**Verdict:** PASS
