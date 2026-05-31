# Evidence — lab-og-weekly-prospects-formula-live

**Date:** 2026-05-31  
**Atom:** Lab L5 OG live panel rows parity 3/3  
**Content commit:** (filled in standup metadata commit)

## Acceptance

| Check | Result |
|-------|--------|
| pytest `test_og_launch10_formula_live.py` | 7 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/weekly?download=1` | 200, 70018 bytes PNG |
| `curl /og/prospects?download=1` | 200, 63453 bytes PNG |

## Change

- `extractWeeklyHeatmapRows` / `extractProspectsRows` prefer `formula_score` when present.
- `weeklyStatKeys` / `prospectsStatKeys` mirror efficiency/aging priority on generic live fetch.

## Verdict

**PASS** — Gate C2 (PNG ≥ 40KB, real layout)
