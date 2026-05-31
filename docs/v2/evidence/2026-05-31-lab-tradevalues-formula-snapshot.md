# Evidence — Lab trade values formula-ranked OG snapshot

**Date:** 2026-05-31  
**Atom:** `lab-tradevalues-formula-snapshot`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped
```

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/tradevalues?download=1` | 200 | 62488 | PNG 1200×630, demo fallback |
| `/og/tradevalues?download=1&snapshot=…` | 200 | 62441 | PNG 1200×630, `N · Value` or `N · {formula}` rows · from your panel |

## Product

- `TradeValuesRenderer` `ogSnapshotRows` ranks top 6 visible rows with `rank · Value` or `rank · {formula.name}` when composite sort is active.
