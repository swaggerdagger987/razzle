# Evidence — lab-og-dashboard-live-extract

**Date:** 2026-05-31  
**Atom:** `lab-og-dashboard-live-extract` — dashboard OG live extract mirrors DynastyDashboardRenderer  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1'
# 200 66547

file /tmp/og-dashboard.png
# PNG 1200x630
```

## Tests / build

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_dashboard_live_extract.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0
```
