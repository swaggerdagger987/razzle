---
id: S2-126
severity: S2
confidence: HIGH
category: football-accuracy
source: FUNC-028
status: OPEN
---

# College endpoints compute QB opportunities wrong (2 instances)

## Root Cause

Two functions in `backend/live_data/college.py` compute opportunities without checking if the player is a QB:

1. **college.py:1071** — `_fetch_college_stock_watch_uncached()`: Uses `opportunities = carries + targets + (d["pass_attempts"] or 0)` which adds ALL three metrics together. For QBs, this triple-counts (pass_attempts already includes the "attempts" component). For non-QBs, it erroneously adds pass_attempts (usually 0, but not always for wildcat players).

2. **college.py:2373** — `_fetch_college_stat_explorer_uncached()`: Uses `opps = carries + targets` with no QB check. At line 2395, this `opps` computes `opportunities_g` which is wrong for QBs (should use pass_attempts + carries).

**NFL-side functions are CORRECT** — `dashboards.py:141-144`, `:731-734`, `:1239-1242`, `:1556-1559` all have proper `if pos == "QB"` checks. `college.py:558-559` (efficiency) is also correct.

## Fix

1. At `college.py:1071`, change to:
```python
if pos == "QB":
    opportunities = (d["pass_attempts"] or 0) + carries
else:
    opportunities = carries + targets
```

2. At `college.py:2373`, add position check:
```python
if pos == "QB":
    opps = (d.get("pass_attempts") or 0) + carries
else:
    opps = carries + targets
```

## Files to Change

- `backend/live_data/college.py:1071` — stock watch opportunities
- `backend/live_data/college.py:2373` — stat explorer opportunities

## Accept When

1. College QBs show pass_attempts + carries as opportunities (not targets + carries)
2. College non-QBs still show targets + carries
3. No regressions in NFL-side PPO calculations
