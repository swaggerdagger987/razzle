# Evidence — Lab dashboard OG top5 fallback

**Date:** 2026-05-31  
**Slice:** `lab-dashboard-og-top5-fallback` — Dynasty dashboard + OG route prefer movers, else top5 PPG rows

| Check | Result |
|-------|--------|
| Build | `npm run build --workspace=apps/web` → exit 0 |
| API tests | `JWT_SECRET=test pytest apps/api/tests -q` → 51 passed, 5 skipped |
| OG curl | `curl /og/dashboard?download=1` → **200 60034** bytes PNG (demo rows; API offline) |
| PNG type | `file` → PNG 1200×630 |

**Code:** `DynastyDashboardRenderer` top5 snapshot when risers/fallers empty; export footer when rows exist. `extractRows` in OG route uses movers-first, top5 fallback.

**Verdict:** PASS
