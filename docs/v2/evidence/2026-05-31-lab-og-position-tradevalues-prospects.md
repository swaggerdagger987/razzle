# Evidence — Lab OG position trade values + prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 52 passed; 2 screener snapshot fails pre-existing on VM (same on clean base)
```

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/tradevalues?download=1&position=WR` | 200 | 51115 | PNG 1200×630, position filter in query |
| `/og/tradevalues?download=1` | 200 | 62488 | unscoped demo fallback |

## Product

- `TradeValuesRenderer` passes `position` to `LabOgExportLink` (Prospects already did).
- Snapshot rows use `rank · Value` or `rank · {formula.name}` on top 6 visible sort.
