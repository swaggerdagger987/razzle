## Ticket: A-003
- Route: `/api/explore/query`, `/api/explore/filter-options`
- Before: Explore data was available through `/api/screener/query` and `/api/filter-options`, but the namespaced `/api/explore/*` contract did not exist.
- After: `/api/explore/query` reuses the screener request/response model, and `/api/explore/filter-options` reuses the existing filter option provider.
- Verification:
  - `JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_aliases.py -q` — PASS
  - `JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_aliases.py apps/api/tests/test_smoke.py -q` — PASS
  - `JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q` — FAIL in `test_nfl_screener_default_universe`: local SQLite is missing `player_week_stats`
  - `python3 scripts/sync_data.py --status` — FAIL: local SQLite is missing `players`
- Verdict: PASS for A-003; full-suite data-backed screener verification is blocked by empty local data.
