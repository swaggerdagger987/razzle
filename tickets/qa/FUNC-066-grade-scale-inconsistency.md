# FUNC-066: Efficiency grade inconsistency across endpoints

**Severity**: P1
**Flow**: 36 (Efficiency metrics), 62 (Report Cards)
**Found**: Session 66 (2026-03-21)
**Status**: OPEN

## Summary

Two different grading functions produce different efficiency grades for the same player.
McCaffrey gets efficiency grade **C** from report cards but **D** from efficiency rankings.
Same metric (PPO percentile), different letter grades depending on which page you check.

## Root Cause

Two separate grading functions with incompatible scales:

1. `backend/live_data/dashboards.py:_grade_from_percentile()` — **8-tier** (A+/A/B+/B/C+/C/D/F)
   - Used by: report cards, stock watch, season awards, consistency, SOS
2. `backend/live_data/core.py:_efficiency_grade()` — **12-tier** (A+/A/A-/B+/B/B-/C+/C/C-/D+/D/D-)
   - Used by: efficiency rankings (`analytics.py:1022`), buy-sell candidates

## Evidence

```
Report Cards (dashboards.py 8-tier):
  McCaffrey eff=C, grades: A+:2, A:5, B+:7, B:5, C+:7, C:7, D:6, F:11

Efficiency Rankings (core.py 12-tier):
  McCaffrey grade=D, grades: A+:13, A:17, C:2, D:23, F:5

Buy-Sell (core.py 12-tier):
  Produces A-/C-/D+/D- grades not in 8-tier system
```

## Impact

- User sees "C" on report cards, "D" on efficiency rankings for the same player
- Buy-sell page shows grades (A-, C-, D+, D-) that don't exist on other pages
- Dynasty veterans will notice the inconsistency and lose trust

## Fix

Replace `core.py:_efficiency_grade()` with the canonical 8-tier `_grade_from_percentile()` from dashboards.py.
Or better: extract a single shared function and import it everywhere.

Files to change:
- `backend/live_data/core.py:999-1025` — replace 12-tier with 8-tier
- `backend/live_data/analytics.py:26` — import from shared location
- Verify `college.py:23` already matches (it does)
