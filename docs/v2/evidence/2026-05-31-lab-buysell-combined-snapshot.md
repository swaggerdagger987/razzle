# Evidence — Lab buy/sell combined OG snapshot

**Date:** 2026-05-31  
**Atom:** `lab-buysell-combined-snapshot`  
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
| `/og/buysell?download=1` | 200 | 58072 | PNG 1200×630, demo fallback |
| `/og/buysell?download=1&snapshot=…` | 200 | 57884 | PNG 1200×630, Buy/Sell lane rows · from your panel |

## Product

- `BuySellRenderer` `ogSnapshotRows` interleaves top 3 buy-low + top 3 sell-high with `Buy` / `Sell` stat labels (formula name appended when sorted).
