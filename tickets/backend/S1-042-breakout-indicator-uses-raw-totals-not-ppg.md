---
id: S1-042
severity: S1
confidence: HIGH
category: football-accuracy
source: FUNC-017
status: OPEN
---

# Breakout indicator uses raw season PPR totals instead of per-game averages

## Root Cause

`backend/live_data/core.py:403` — `_enrich_with_breakout()` computes breakout percentage using `SUM(fantasy_points_ppr)` (raw season totals) instead of PPG (per-game averages). The threshold at line 426 (`prev_ppr > 20`) is calibrated for raw totals, not PPG.

**Example**: CMC shows BREAKOUT +772% (2025) because raw totals went 47.8 → 416.6. The correct PPG comparison is 11.9 → 24.5 = ~106%.

The frontend (`player.js:76-82`) correctly uses PPG with `prevPPG >= 8` threshold, but the backend breakout enrichment overrides this with the wrong values.

## Fix

In `backend/live_data/core.py:403`, change:
```sql
SELECT player_id, season, ROUND(SUM(fantasy_points_ppr), 1) as ppr
```
to:
```sql
SELECT player_id, season,
  ROUND(SUM(fantasy_points_ppr), 1) as ppr,
  COUNT(*) as gp,
  ROUND(SUM(fantasy_points_ppr) * 1.0 / COUNT(*), 1) as ppg
```

Then at line 426, use PPG for the comparison:
- Change threshold from `prev_ppr > 20` to `prev_ppg >= 8` (matching frontend)
- Compute `pct_change` on PPG, not raw totals
- Add `prev_gp >= 10 and curr_gp >= 10` games-played guard (matching frontend)

## Files to Change

- `backend/live_data/core.py:390-440` — `_enrich_with_breakout()` function

## Accept When

1. CMC 2025 breakout pct is ~106% (PPG-based), not 772%
2. Players with fewer than 10 games in either season are excluded
3. Minimum PPG threshold is 8+ (not 20 raw points)
4. No false breakout badges on players who simply played more games

## Do NOT Touch

- Frontend `player.js:71-86` (already correct)
- Breakout candidates dashboard (`analytics.py`) — separate calculation
