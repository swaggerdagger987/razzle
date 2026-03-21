# FUNC-058: Snap count sync fails for 79% of 2025 players due to stale team in players table

**Severity**: P2 (local DB only — prod has correct snap data)
**Flow**: 36 (Efficiency metrics), 42 (Workload), 33 (Snap Efficiency)
**Found**: Session 54, 2026-03-21
**Status**: OPEN

**Note**: This issue only affects the local development database. Production (razzle.lol) has correct snap data because the DB was rebuilt with the corrected adapter. The underlying `players.team` staleness still exists in the adapter code and will resurface if a new DB is built without the team update step. The fix should prevent this on future DB rebuilds.

## Summary

The `sync_snap_counts()` function in `nflverse_adapter.py` matches players by `(search_name, team, position)` using the `players` table. But 41% of active 2025 players have stale teams in the `players` table (e.g., McCaffrey = CAR instead of SF, Stafford = DET instead of LA). The snap counts CSV uses current teams, so the lookup fails silently.

## Impact

- **1601 out of 2024** active 2025 players have no snap data (79%)
- Only **423 players** (21%) have snap_share populated
- `snap_share` filter silently excludes elite players (McCaffrey, Henry, Barkley, Jacobs, Swift)
- Affects: screener snap_share filter, snap efficiency panel, workload panel, any panel using offense_snaps/offense_pct

## Root Cause

`build_player_lookup()` (line 401-410) creates the name_map from `players` table:
```python
name_map[(row["search_name"], row["team"], row["position"])] = row["player_id"]
```

The `players.team` field is set from the original nflverse roster data (often the player's draft team or an old team). It's never updated when players change teams.

`sync_snap_counts()` (line 727-734) looks up using the snap CSV's `team` field (current team):
```python
search = normalize_name(player_name)
for pos in ("QB", "RB", "WR", "TE", "FB", "K", "P"):
    if (search, team, pos) in name_map:
        pid = name_map[(search, team, pos)]
```

Since `name_map` has `(christianmccaffrey, CAR, RB)` but the CSV provides `team=SF`, no match occurs.

## Evidence

```
McCaffrey in players table: team=CAR (should be SF)
McCaffrey in player_week_stats: team=SF (correct)
McCaffrey snap_share in screener: None

836/2024 active players have stale teams (41%)
Only 4536/19414 weekly rows have snap data (23%)
```

## Fix Options

1. **Quick fix**: In `sync_snap_counts()`, also try matching without team constraint as fallback:
   ```python
   # If team-specific match fails, try name+position only
   if not pid:
       for pos in ("QB", "RB", "WR", "TE", "FB"):
           for t in all_teams:
               if (search, t, pos) in name_map:
                   pid = name_map[(search, t, pos)]
                   break
   ```

2. **Proper fix**: Update `players.team` from `player_week_stats` latest data before running snap sync:
   ```sql
   UPDATE players SET team = (
       SELECT pws.team FROM player_week_stats pws
       WHERE pws.player_id = players.player_id
       ORDER BY pws.season DESC, pws.week DESC LIMIT 1
   ) WHERE player_id IN (SELECT DISTINCT player_id FROM player_week_stats WHERE season = ?)
   ```

3. **Best fix**: Build a secondary lookup in `build_player_lookup()` that maps `(search_name, position)` -> `player_id` (without team) as a fallback when the team-specific match fails.

## Verification

After fix, run:
```python
# Should show > 1500 players with snap data
SELECT COUNT(DISTINCT player_id) FROM player_week_stats
WHERE season=2025 AND offense_snaps IS NOT NULL
```

McCaffrey should have `snap_share = 83.1` in the screener response.
