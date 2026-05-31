# Evidence — lab-og-weekly-ppg-ranked (2026-05-31)

## Slice

Weekly heatmap OG snapshot ranks top-6 by PPG for the active position tab; passes `position` on export link.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/weekly-og.png -w 'HTTP %{http_code} size %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&position=WR'
# HTTP 200 size 53320
```

## Files

- `apps/web/components/lab/renderers/WeeklyHeatmapRenderer.tsx` — filter by `position`, sort PPG desc, `useMemo` deps include position

## Reality

PASS — Gate C2 weekly OG PNG ≥40KB with position param
