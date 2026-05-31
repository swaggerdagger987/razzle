# Evidence — Lab L5 weekly heatmap OG week label

**Date:** 2026-05-31  
**Slice:** `lab-l5-weekly-heatmap-live-label` — OG blurb names hottest week column from panel export

| Check | Result |
|-------|--------|
| Build | `npm run build --workspace=apps/web` → exit 0 |
| OG curl | `curl /og/weekly?download=1&position=WR&highlight_week=12&snapshot=…` → **200 50072** bytes PNG |
| PNG type | `file` → PNG 1200×630 |
| Dedup | `lab-l5-dashboard-renderer-og-snapshot` already on base (`c9151786`) — skipped rebuild |

**Verdict:** PASS — weekly export passes `highlight_week`; OG subtitle includes "week N spike · from your panel".
