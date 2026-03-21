# FUNC-030: Ship Loop code fixes exist but are NOT deployed

## Severity: P0 — "I just made a bad trade because of this tool"

## Summary

Multiple code fixes committed to `ship/launch-fixes` between 22:50-23:04 on 2026-03-20 are NOT running on either the local dev server or production (razzle.lol). The local server was started at 21:26 and is running stale code. Production has never received these fixes.

## Affected Fixes (committed but not running)

### 1. QB PPO / Efficiency Rankings (commit 4163512, 23:04)
- **Before**: QB opportunities = targets + carries (same as RB/WR/TE)
- **After**: QB opportunities = pass_attempts + carries
- **Impact**: Baker Mayfield shows PPO=6.1 (should be ~0.58 with 630 opportunities). QBs dominate "most efficient" list with 3-6x inflated PPO values. Users making trade decisions based on wrong efficiency data.
- **Verified**: Direct DB query returns pass_att=570 for Mayfield. API returns Opp=60 (just carries).
- **Files**: `backend/live_data/dashboards.py:78,121-122`

### 2. QB td_rate and fumble_rate (commit 4163512, 23:04)
- **Before**: td_rate = all TDs / (carries + targets) — Stafford showed 158%
- **After**: QB td_rate = passing_tds / attempts
- **Files**: `backend/live_data/dashboards.py:139-142`, `backend/live_data/players.py:1007-1010`

### 3. PBP week leak (commit 4163512, 23:04)
- **Before**: Season PBP totals appeared alongside single-week stats
- **After**: `_enrich_with_pbp_stats` skips when week > 0
- **Files**: `backend/live_data/core.py:497-500`

### 4. College/prospect table guards (commits 3c43a9a + 0bd0937, 22:50-22:54)
- **Before**: 500 Internal Server Error when combine_data/cfb_player_season_stats tables missing
- **After**: Graceful empty response via `_has_table()` checks
- **Impact**: Lab page hits 2x 500 errors on load (prospect-options + college/filter-options)
- **Files**: `backend/live_data/prospects.py`, `backend/live_data/college.py`

## Evidence

```
# Prod (razzle.lol) — QB PPO still wrong:
Baker Mayfield: Opp=60.0, PPO=6.1 (should be Opp=630, PPO=0.58)
Geno Smith: Opp=53.0, PPO=5.02
Patrick Mahomes: Opp=59.0, PPO=4.8

# Local — college endpoints crash:
GET /api/prospect-options → 500 Internal Server Error
GET /api/college/filter-options → 500 Internal Server Error

# Direct DB query proves data is correct:
Baker Mayfield: pass_att=570, carries=60, opp=630
Lamar Jackson: pass_att=474, carries=139, opp=613
```

## Fix

1. Restart local dev server to pick up committed fixes
2. Push `ship/launch-fixes` to origin
3. Deploy to Render (auto-deploys from master or trigger manual deploy)

## Blocking

This blocks verification of FUNC-021 (QB PPO), FUNC-022 (QB td_rate), FUNC-023 (PBP week leak), and college/prospect table guard fixes. All code is correct but not running.

## Files
- All fixes are committed in `ship/launch-fixes` branch
- Commits: 4163512, 3c43a9a, 0bd0937
