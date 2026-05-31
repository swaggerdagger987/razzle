# Evidence — Lab weekly hot-week OG snapshot

**Date:** 2026-05-31  
**Atom:** `lab-weekly-hot-week-snapshot`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped
```

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/weekly?download=1` | 200 | 63819 | PNG 1200×630, demo/live fallback |
| `/og/weekly?download=1&snapshot=…` | 200 | 51665 | PNG 1200×630, Wk N hot-week rows · from your panel |

## Product

- `WeeklyHeatmapRenderer` `ogSnapshotRows` ranks players by single hottest week (`Wk N` stat label), not season PPG — export card matches heatmap spike rows.
