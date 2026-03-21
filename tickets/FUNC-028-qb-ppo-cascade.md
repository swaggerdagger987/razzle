# FUNC-028: QB PPO cascade — 3 functions still use broken opportunities formula

## Severity: P0 — "I just made a bad trade because of this tool"

## Summary

FUNC-021 fixed the QB PPO bug in `fetch_efficiency_rankings` (pass_attempts+carries instead of targets+carries). But THREE other functions copy-paste the same broken formula. QBs dominate "Most Efficient," have distorted stock scores, and get inflated Report Card GPAs.

## Evidence (PROD — 2025 season)

```
Season Awards "Most Efficient":
  Winner: Jared Goff (QB)       ← WRONG. QB PPO inflated by dividing by ~60 rushes
  Runner: Matthew Stafford (QB)
  Runner: Aaron Rodgers (QB)
  Runner: Joe Burrow (QB)
  (All 4 runners-up are QBs — no RB/WR/TE in top 5)

Report Card (QB filter):
  Baker Mayfield: efficiency=A  ← WRONG. Mid-tier QB, inflated by ~55 carry opportunities
  Patrick Mahomes: efficiency=B+

Stock Watch (QB filter, falling):
  Josh Allen: score=59          ← Allen is consensus top-5 dynasty QB but shows as falling
  Drake Maye: score=60          ← Efficiency distortion affects composite score
```

A dynasty vet seeing Goff win "Most Efficient" or Mayfield grade A in efficiency would immediately close the tab.

## Root Cause

Ship Loop commit `4163512` fixed `fetch_efficiency_rankings` but the same bug exists in 3 sister functions. All four share near-identical code (weekly aggregation loop → opportunities → PPO → percentiles), but each function was written independently.

| Function | File | Line | Fetches `s.attempts`? | QB-specific logic? | Status |
|---|---|---|---|---|---|
| `fetch_efficiency_rankings` | dashboards.py | 78, 121 | YES | YES | **FIXED** |
| `fetch_stock_watch` | dashboards.py | 639, 739 | NO | NO | **BROKEN** |
| `fetch_report_cards` | dashboards.py | 1102, 1244 | NO | NO | **BROKEN** |
| `fetch_season_awards` | dashboards.py | 1412, 1569 | NO | NO | **BROKEN** |

Each broken function needs TWO changes:

### 1. Add `s.attempts` to the SQL query

```sql
-- Current (all 3 functions):
SELECT s.player_id, p.full_name, p.position, p.team,
       p.headshot_url, p.age,
       s.fantasy_points_ppr, s.targets, s.carries, ...

-- Fixed:
SELECT s.player_id, p.full_name, p.position, p.team,
       p.headshot_url, p.age,
       s.fantasy_points_ppr, s.targets, s.carries, s.attempts, ...
```

### 2. Add QB position check in opportunities calculation

```python
# Current (all 3 functions):
opportunities = opps_d["targets"] + opps_d["carries"]

# Fixed:
pos = info["position"]
if pos == "QB":
    opportunities = opps_d["attempts"] + opps_d["carries"]
else:
    opportunities = opps_d["targets"] + opps_d["carries"]
```

Also update the `player_opps` defaultdict to include `"attempts": 0` and accumulate it in the aggregation loop:

```python
player_opps = defaultdict(lambda: {"targets": 0, "carries": 0, "attempts": 0, "total_pts": 0, "games": 0, ...})
# In loop:
d["attempts"] += r[NEW_ATTEMPTS_INDEX] or 0
```

## Impact

- **Season Awards**: "Most Efficient" always goes to a QB (should be position-diverse or dominated by efficient RBs/WRs)
- **Stock Watch**: QB stock scores distorted — efficiency percentile inflated → composite score wrong → rising/falling classification wrong
- **Report Card**: QB GPA inflated (20% of GPA comes from efficiency grade based on broken PPO) → honor roll skewed toward QBs

## Files
- `backend/live_data/dashboards.py` — lines 614-868 (stock_watch), 1071-1384 (report_cards), 1386-1836 (season_awards)

## Related
- FUNC-021 (original bug, fixed for efficiency_rankings only)
- Copy the EXACT pattern from `fetch_efficiency_rankings` lines 78, 117-124
