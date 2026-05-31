# Evidence — Lab OG weekly heatmap snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-snapshot`  
**File:** `apps/web/components/lab/renderers/WeeklyHeatmapRenderer.tsx`

## Change

`WeeklyHeatmapRenderer` builds top-6 PPG `OgSnapshotRow[]` from the loaded heatmap and passes them to `LabOgExportLink` with the active position filter. OG route shows ` · from your panel` when snapshot param is present.

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&snapshot=eyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDTk4iLCJzIjoyNC42LCJzbCI6IlBQRyJ9LHtuIjoiQmlqYW4gUm9ibnNvbiIsInAiOiJSQiIsInQiOiJBUkwiLCJzIjoyMi4xLCJzbCI6IlBQRyJ9XQ&position=WR'
# 200 53320
curl -s -o /tmp/og-weekly-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1'
# 200 63819
file /tmp/og-weekly-snap.png  # PNG 1200x630
```

## Verdict

PASS — Gate C2 PNG ≥40KB on snapshot and demo paths; in-panel PPG leaders travel on export link.
