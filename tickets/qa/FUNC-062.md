# FUNC-062: Season Awards "Volume King" — QB opportunity share formula uses wrong denominator

**Severity**: P1
**Flow**: 62 (Dashboard / Awards)
**Found**: Session 56, 2026-03-21
**Status**: OPEN

## Summary

The "Volume King" award measures opportunity share as `(player_opportunities / team_targets_plus_carries) * 100`. For QBs, `player_opportunities` includes pass attempts (~500+), but `team_targets_plus_carries` does NOT include pass attempts. This mixes incompatible units, making QB "opportunity share" artificially 55-65% and guaranteeing QBs always win.

## Impact

- **All top 5 Volume Kings are QBs**: Bo Nix, Cam Ward, Baker Mayfield, Matthew Stafford, Caleb Williams
- No RB/WR ever appears because their touch-based opportunities (100-350) can never beat a QB's pass attempts (450-600) when measured against the same denominator
- The award is supposed to identify bellcow RBs or target hogs, not QBs
- A dynasty veteran immediately knows something is wrong when all Volume Kings are QBs
- The /opportunity-share endpoint handles this correctly by only showing RB/WR/TE

## Root Cause

`backend/live_data/dashboards.py:1588-1591`:
```python
if pos == "QB":
    opportunities = opps_d["attempts"] + opps_d["carries"]  # ~550
else:
    opportunities = opps_d["targets"] + opps_d["carries"]  # ~150
```

`backend/live_data/dashboards.py:1616-1617`:
```python
team_opps = tt["targets"] + tt["carries"]  # ~900 (does NOT include pass attempts)
opp_share = round(opportunities / team_opps * 100, 1)  # QB: 550/900 = 61.1%
```

QB pass attempts are numerator, team targets+carries are denominator = apples to oranges.

## Evidence

```
Volume King Top 5 (all QBs):
  1. Bo Nix (QB)
  2. Cam Ward (QB)
  3. Baker Mayfield (QB)
  4. Matthew Stafford (QB)
  5. Caleb Williams (QB)

Expected (bellcow RBs / target hogs):
  McCaffrey (RB): 46.8% opp share (from /api/opportunity-share)
  Ashton Jeanty (RB): 39.4%
  Bijan Robinson (RB): 39.2%
```

## Fix

Option A — Exclude QBs from Volume King:
```python
# In award_defs for volume_king, add filter
"filter": lambda p: p["position"] != "QB",
```

Option B — Use consistent opportunity definition for QBs:
```python
# Add pass attempts to team_opps when computing QB opp share
if pos == "QB":
    # QB opp share = (attempts + carries) / (team_attempts + team_carries)
    team_pass_att = tt.get("attempts", 0)
    qb_team_opps = team_pass_att + tt["carries"]
    opp_share = round(opportunities / qb_team_opps * 100, 1) if qb_team_opps > 0 else 0
```

Option A is simpler and matches what the /opportunity-share endpoint does.

## Verification

After fix, Volume King should be an RB (McCaffrey, Jeanty, Robinson, etc.) — not a QB.
