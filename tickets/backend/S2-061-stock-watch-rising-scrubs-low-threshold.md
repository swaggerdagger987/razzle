# S2-061: Stock Watch rising players are low-volume scrubs — min thresholds too permissive

**Severity**: S2 (Medium)
**Category**: Data Quality / Logic
**Source**: functional-qa/results.tsv FUNC-013

## Problem

The Stock Watch "rising" list surfaces replacement-level scrubs instead of meaningful breakout candidates. Example: Powell (2 PPG), Shenault (2.5 PPG) appear as top rising WRs. This makes the feature misleading for dynasty decision-making.

## Root Cause

`backend/live_data/dashboards.py:715-728` has two issues:

1. **PPG minimums too low** — line 715:
   ```python
   MIN_PPG = {"QB": 10, "RB": 5, "WR": 5, "TE": 3}
   ```
   A WR averaging 5 PPG is waiver-wire noise, not a rising stock. A replacement-level WR36 averages ~8 PPG.

2. **No minimum games played filter** — The function requires 8 weeks of data (line 719: `if n < 8: continue`) but doesn't filter by minimum games actually played. A player can have 8 weeks of data with only 2 games played if the DB has null/zero rows for inactive weeks.

## Related Issue

FUNC-060 reported PPO null for 20/21 TEs due to opportunity thresholds. The TE threshold was lowered to 20 at line 735, which is reasonable. But the PPG threshold for TEs (3.0) still allows extreme scrubs through.

## Fix

1. Raise PPG minimums to match replacement-level baselines:
   ```python
   MIN_PPG = {"QB": 12, "RB": 8, "WR": 8, "TE": 5}
   ```

2. Add minimum games played filter:
   ```python
   games_played = sum(1 for w in weeks if w > 0)
   if games_played < 6: continue
   ```

3. Consider adding a minimum opportunity threshold (targets + carries) alongside PPG to exclude low-volume fluke games.

## Acceptance Criteria

1. No player averaging < 8 PPG (WR/RB) or < 5 PPG (TE) appears in rising stocks
2. Players with fewer than 6 games played are excluded
3. Rising stock list surfaces actual breakout candidates, not waiver-wire noise
