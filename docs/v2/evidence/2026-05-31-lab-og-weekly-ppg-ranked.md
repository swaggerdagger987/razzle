# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1&position=WR'
file /tmp/og-weekly.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG weekly WR | `200 53249` bytes PNG |

## Change

`rankOgRowsForPanel` + `PANEL_OG_STAT_KEY.weekly=ppg` — OG share cards sort top-6 by PPG with position tab filter, matching `WeeklyHeatmapRenderer` snapshot export.
