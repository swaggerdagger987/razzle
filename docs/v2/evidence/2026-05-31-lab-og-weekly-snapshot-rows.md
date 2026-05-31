# Evidence — Lab L5 weekly OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-snapshot-rows`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&position=WR&snapshot=<encoded>'
curl -s -o /tmp/og-weekly-live.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&position=WR'
file /tmp/og-weekly-snap.png
```

## Results

- Snapshot curl: **200**, **47384** bytes, PNG 1200×630
- Live (no snapshot): **200**, **53320** bytes, PNG 1200×630

## Change

`WeeklyHeatmapRenderer` passes top-6 PPG rows + position filter into `LabOgExportLink` so OG matches the in-panel heatmap.
