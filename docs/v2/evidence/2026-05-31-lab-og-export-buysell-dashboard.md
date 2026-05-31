# Evidence — Lab OG export links (buy-sell + dashboard)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-buysell-dashboard`  
**Verdict:** PASS

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/buysell?download=1` | 200 | 58072 | PNG 1200×630 |
| `/og/dashboard?download=1` | 200 | 60034 | PNG 1200×630 |

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## UI

- `LabOgExportLink` in BuySellRenderer footer (slug `buysell`)
- `LabOgExportLink` in DynastyDashboardRenderer footer (slug `dashboard`)
