# Evidence — lab-og-dashboard-live-extract

**Date:** 2026-05-31  
**Atom:** `lab-og-dashboard-live-extract` — Dashboard OG live extract mirrors DynastyDashboardRenderer snapshot  
**Trust:** T5, T6

## Build

- `PATH=$HOME/.local/bin:$PATH python3 -m pytest apps/api/tests/test_og_dashboard_live.py -q --noconftest` — 4 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — dashboard OG PNG

```bash
curl -s -o /tmp/dashboard-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1&snapshot=<6-row Chg board>'
# 200 65370

curl -s -o /tmp/dashboard-live.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1'
# 200 66547
```

## Code

- `extractDashboardRows` in `apps/web/app/og/[panel]/route.tsx` — top5 Value → risers/fallers Chg → value_picks Value with player_id dedupe (matches `DynastyDashboardRenderer` ogSnapshotRows).
- `apps/api/tests/test_og_dashboard_live.py` — source guards + snapshot codec fixture.

## Verdict

PASS — dashboard snapshot/live OG ≥40KB PNG; live extract epic atom 1/3.
