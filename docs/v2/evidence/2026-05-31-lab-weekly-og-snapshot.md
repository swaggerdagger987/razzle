# Evidence — Lab weekly OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-weekly-og-snapshot`  
**Verdict:** PASS (Gate C2)

## Change

`WeeklyHeatmapRenderer` builds `ogSnapshotRows` from loaded heatmap players (peak week FPTS, fallback PPG) and passes `snapshotRows` + `position` to `LabOgExportLink`.

## curl (dev server :3000)

```bash
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?position=WR&download=1'
# 200 53320

curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?position=WR&snapshot=<encoded>&download=1'
# 200 44549
```

Both PNGs ≥40KB. `file` reports 1200×630 RGBA.

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
