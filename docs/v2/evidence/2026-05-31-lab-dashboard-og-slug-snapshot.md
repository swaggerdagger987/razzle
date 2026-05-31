# Evidence — Lab dashboard OG slug + snapshot

**Date:** 2026-05-31  
**Slice:** `lab-dashboard-og-slug-snapshot` — DashboardRenderer exports `/og/dashboard` with riser/faller rows

| Check | Result |
|-------|--------|
| Build | `npm run build --workspace=apps/web` → exit 0 |
| API tests | `JWT_SECRET=test python3 -m pytest apps/api/tests -q` → 51 passed, 5 skipped |
| OG curl | `curl /og/dashboard?download=1` → **200 60034** bytes PNG |
| PNG type | `file` → PNG 1200×630 |

**Code:** `DashboardRenderer` uses `slug="dashboard"` and `snapshotFromDashboard()` (risers/fallers, top5 fallback).

**Verdict:** PASS
