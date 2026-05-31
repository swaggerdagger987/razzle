# Evidence — Lab L5 weekly heatmap OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-weekly`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## OG curl (snapshot query)

```bash
curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&position=WR&snapshot=eyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDTU4iLCJzIjoyNC42LCJzbCI6IkZUUFMifSx7Im4iOiJCaWphbiBSb2JpbnNvbiIsInAiOiJSQiIsInQiOiJBVEwiLCJzIjoyMi4xLCJzbCI6IkZUUFMifSx7Im4iOiJNYXJ2aW4gSGFycmlzb24gSXIuIiwicCI6IldSIiwidCI6IkFSSSIsInMiOjE0LjIsInNsIjoiRlRQUyJ9XQ'
# 200 53320
file /tmp/og-weekly-snap.png
# PNG image data, 1200 x 630
```

PNG: 1200×630, ≥40KB — visible heatmap leaders encoded via `LabOgExportLink.snapshotRows` + position filter.
