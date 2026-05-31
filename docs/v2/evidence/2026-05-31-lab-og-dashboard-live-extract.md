# Evidence — lab-og-dashboard-live-extract

**Date:** 2026-05-31  
**Atom:** `lab-og-dashboard-live-extract` — Dashboard OG mirrors DynastyDashboardRenderer Value/Chg rows  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1'
# 200 65728

file /tmp/og-dashboard.png
# PNG 1200x630
```

- Route: `/og/dashboard` with `download=1`
- Size ≥40KB (demo fallback when API empty; live extract uses top5 Value → riser/faller Chg)

## Build / tests

- `pytest apps/api/tests/test_og_dashboard_live_extract.py apps/api/tests/test_og_launch10_formula_live.py` — 4 passed
- `npm run build --workspace=apps/web` — exit 0
