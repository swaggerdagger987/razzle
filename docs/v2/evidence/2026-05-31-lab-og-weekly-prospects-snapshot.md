# Evidence — Lab L5 weekly + prospects OG snapshot export

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-prospects-snapshot`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/weekly?download=1&position=WR&snapshot=<encoded>'
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/prospects?download=1'
```

## Results

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/weekly?download=1&position=WR&snapshot=…` | 200 | 48814 | Snapshot rows render; PNG valid |
| `/og/prospects?download=1` | 200 | 58084 | Live/demo rows; PNG valid |

## Product check

- `WeeklyHeatmapRenderer` passes `snapshotRows` + `position` from sorted panel players (PPG).
- `ProspectsRenderer` passes top-6 prospect RPS rows with school as team field.
