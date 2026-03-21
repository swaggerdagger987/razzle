# FUNC-023: PBP stats leak season totals into per-week screener queries

**Severity**: P1 — "This tool doesn't actually work"
**Flow**: 7 (Week filter), 36 (Efficiency metrics)
**Found**: Session 27 (2026-03-20)
**Status**: OPEN

## Summary

When a user selects a specific week in the screener (e.g., Week 1), core stats (passing_yards, rushing_yards, receptions, games) are correctly filtered to that week. However, all PBP-derived stats (scramble_attempts, gl_carries, garbage_time_pct, pass_success_rate, etc.) are always season totals regardless of the week selected.

This means a user looking at Week 1 data sees "scramble_attempts=48" for Josh Allen when the real Week 1 value is much lower. The season total is presented alongside single-week stats in the same row, with no indication that they're from different scopes.

## Prod Evidence (Session 27, 2026-03-20)

```
Josh Allen, Week 1:
  GP=1, passing_yards=394, rushing_yards=30  ← correctly week-scoped
  scramble_attempts=48, gl_carries=17        ← SEASON totals (impossible in 1 game)
  garbage_time_pct=0.078, avg_score_diff=-2.7 ← SEASON averages

Josh Allen, Full Season:
  GP=16, passing_yards=394+...
  scramble_attempts=48, gl_carries=17        ← IDENTICAL to week query
```

## Root Cause

`backend/live_data/core.py:481-543` — `_enrich_with_pbp_stats()`:

```python
def _enrich_with_pbp_stats(conn, items, season=None, career_mode=False, week=0):
    # ...
    query = f"""
        SELECT player_id, pass_success_rate, rush_success_rate, ...
        FROM player_season_pbp
        WHERE player_id IN ({placeholders}) AND season = ?
    """
    # week parameter is received but NEVER used in the query
```

The `player_season_pbp` table is season-level only (no `week` column), so the data cannot be filtered by week. The `week` parameter in the function signature is accepted but unused.

## Affected Columns

All PBP-derived columns shown in the screener when week filter is active:
- scramble_attempts, scramble_yards, scramble_tds
- gl_carries, gl_targets, gl_tds
- pass_success_rate, rush_success_rate
- garbage_time_pct, avg_score_differential
- play_action_attempts/completions/yards/tds
- total_ryoe, ryoe_per_carry
- drops, drop_rate
- intended_air_yards, intended_air_yards_per_target
- two_point_conversions, return_yards, return_tds

## User Impact

These PBP columns are available in the screener column picker and in the "Advanced" preset (lab.js:922). A dynasty veteran analyzing weekly performance will see misleading numbers — e.g., "this QB had 48 scrambles in Week 1" when the real number is ~5.

## Fix

Simplest: skip PBP enrichment when `week > 0`:

```python
def _enrich_with_pbp_stats(conn, items, season=None, career_mode=False, week=0):
    if week > 0:
        return items  # PBP data is season-level only, skip for per-week queries
    # ... rest of function
```

This is honest — we don't have per-week PBP data, so we shouldn't pretend we do. The columns will show as empty/null for week-filtered queries, which is correct.

Alternative: show the data but add a visual indicator in the frontend that these are season stats (more work, less honest).
