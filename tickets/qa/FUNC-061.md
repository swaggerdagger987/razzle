# FUNC-061: Season Awards "Most Efficient" has no minimum opportunity threshold

**Severity**: P1
**Flow**: 62 (Dashboard / Awards)
**Found**: Session 56, 2026-03-21
**Status**: OPEN

## Summary

The Season Awards "Most Efficient" award sorts all players by PPO (fantasy points per opportunity) with NO minimum opportunity threshold. This lets barely-relevant players with 3 total touches win over elite producers.

## Impact

- **Efton Chism III** (WR, NE) wins "Most Efficient" 2025 with PPO = 5.50 from **3 total targets** (16.5 PPR / 3 opps)
- This is a player with 2.06 PPG across 8 games — barely fantasy-relevant
- Runner-ups are similarly low-volume (Devontez Walker 8GP/4.7PPG, Cody White 8GP/2.25PPG)
- A dynasty veteran seeing "Most Efficient: Efton Chism III" immediately distrusts the tool
- The /efficiency-rankings endpoint gets this right (has a 50-opp minimum) but the awards function doesn't

## Root Cause

`backend/live_data/dashboards.py:1594`:
```python
ppo = round(total_pts / opportunities, 2) if opportunities > 0 else 0
```

The only filters are 6 games and 2 PPG (line 1576-1584). No minimum opportunity count. A player with 1 target who scored a TD gets PPO = ~8.0, beating every elite player.

## Evidence

```
Efton Chism III (WR, NE):
  8 games, 16.5 PPR, 2.06 PPG
  3 targets, 0 carries, 3 receptions, 75 rec yd, 1 TD
  PPO = 16.5 / 3 = 5.50 (wins award)

Christian Watson (WR, GB):
  10 games, 132.4 PPR, 13.24 PPG
  56 opportunities
  PPO = 2.36 (actual top efficient player with volume)
```

## Fix

Add a minimum opportunity threshold before PPO is considered for awards:
```python
# Line ~1594: Only compute meaningful PPO with volume
MIN_OPPS_FOR_AWARD = 40  # ~2.5 opps/game over 16 games
ppo = round(total_pts / opportunities, 2) if opportunities >= MIN_OPPS_FOR_AWARD else 0
```

Or add a position-specific minimum matching the efficiency-rankings endpoint logic (50 opps for QB/RB/WR, 30 for TE).

## Verification

After fix, the Most Efficient winner should be a player with both high PPO AND meaningful volume (Watson, Kittle, Nacua, etc. — not a 3-touch WR).
