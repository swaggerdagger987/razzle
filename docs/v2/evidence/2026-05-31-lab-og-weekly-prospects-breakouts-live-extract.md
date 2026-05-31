# Evidence — Lab OG weekly/prospects/breakouts live extract

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-prospects-breakouts-live-extract`  
**Verdict:** PASS

## Changes

- `extractWeeklyHeatmapRows` — hottest week per player (`Wk N` label), matches `WeeklyHeatmapRenderer`
- `extractProspectsRows` — `prospects[]` + `player_name` + RPS sort
- `breakouts` — `PANEL_OG_STAT_KEY` uses `rbs_score`; demo labels `RBS`

## Commands

```text
npm run build --workspace=apps/web  → exit 0
curl /og/weekly?position=WR&download=1     → 200 53249 PNG
curl /og/prospects?position=WR&download=1 → 200 48881 PNG
curl /og/breakouts?position=WR&download=1 → 200 61629 PNG
```

## Gate C

All three PNGs ≥ 40KB, 1200×630, real row layout (demo fallback when API empty in CI).
