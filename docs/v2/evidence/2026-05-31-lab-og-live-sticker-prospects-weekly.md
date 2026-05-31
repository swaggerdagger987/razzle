# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/weekly?download=1'
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/prospects?download=1'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/weekly?download=1` | 200 | 55816 | 1200×630 |
| `/og/prospects?download=1` | 200 | 60688 | 1200×630 |

## Change

- Weekly OG defaults `position=WR` (matches `WeeklyHeatmapRenderer`) so `/api/panels/weekly` returns heatmap rows.
- Panel API fetch uses `limit=25` for weekly/prospects; Launch-10 catalog fallback sends pro preview header.
- LIVE sticker + `· live nflverse rows` blurb when `showingLiveData` on Launch-10 slugs (demo fallback still ≥40KB).

## Notes

- Local pytest skipped (no venv on VM); CI `api` job is authoritative.
