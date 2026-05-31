# Evidence — Lab L5 weekly OG snapshot rows

**Date:** 2026-05-31  
**Slice:** `lab-weekly-og-snapshot`  
**Content commit:** `3ee4a675`

## Change

`WeeklyHeatmapRenderer` encodes top-6 players by PPG into `LabOgExportLink` `snapshot` param plus `position` filter — OG card matches the heatmap table.

## Verification

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
# dev server on :3000
curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1&position=WR&snapshot=<encoded>'
file /tmp/og-weekly-snap.png
```

| Check | Result |
|-------|--------|
| build | PASS |
| pytest | 51 passed, 5 skipped |
| OG weekly demo (no snapshot) | 200 53320 |
| OG weekly with snapshot | 200 64762 PNG 1200×630 |

## Verdict

**PASS** — Gate C2 (PNG ≥40KB with snapshot rows).
