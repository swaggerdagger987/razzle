# Evidence — Lab L5 OG export links (buy-sell, dashboard)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-buysell-dashboard`  
**Verdict:** PASS

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/buysell?download=1` | 200 | 58072 | PNG 1200×630, demo rows |
| `/og/dashboard?download=1` | 200 | 60034 | PNG 1200×630, demo rows |

## In-product

- `LabOgExportLink` on BuySellRenderer and DynastyDashboardRenderer footers (matches gamelog/efficiency pattern).
