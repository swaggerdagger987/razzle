# Evidence — lab-og-rankings-dashboard-sort

**Date:** 2026-05-31  
**Atom:** Rankings + dashboard OG direct links sort top-6 by dynasty value / rank change  
**Content commit:** 6c8704cb

## Gate C — OG PNG

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/rankings?position=WR&download=1` | 200 | 50251 | PASS (≥40KB) |
| `/og/dashboard?download=1` | 200 | 60052 | PASS (≥40KB) |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Change summary

- `DIRECT_STAT_SORT_SLUGS` adds `rankings`, `dashboard`
- `DynastyRankingsRenderer` sorts by `dynasty_value` before OG snapshot
- `DynastyDashboardRenderer` sorts movers by `|rank_diff|` before snapshot
- `extractRows` includes `fallers` for dashboard API payload
