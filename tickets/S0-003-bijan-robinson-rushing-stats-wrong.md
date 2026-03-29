---
id: S0-003
severity: S0
category: football-accuracy
title: "Bijan Robinson 2023 rushing stats significantly wrong — nflverse source data gap"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S0-003: Bijan Robinson 2023 rushing stats significantly wrong

## Finding

Bijan Robinson's 2023 rushing stats are severely truncated:
- Rush yards: 976 shown vs 1,463 actual (off by 487)
- Rush TDs: 4 shown vs 8 actual (off by 4)
- Carries: 214 shown vs 247 actual (off by 33)
- Receiving stats for same season are CORRECT (58 rec, 487 rec yds, 4 rec TDs)

His 2024 rush TDs show 14 vs actual ~11 (possible playoff contamination).

Other 2023 RBs (McCaffrey, Gibbs) are correct, so this is player-specific, not systemic.

## Root Cause

**Primary: nflverse source CSV missing week 11 for Bijan Robinson 2023**

Code investigation of the adapter found:

1. **CORE_STATS mapping is correct** (`adapters/nflverse_adapter.py:27-58`) — `rushing_yards`, `rushing_tds`, `carries` are all mapped 1:1 with identical column names in both old and new CSV formats. No renaming issue.

2. **Core stat extraction is correct** (`adapters/nflverse_adapter.py:533-576`) — `row.get(csv_key)` works for all rushing columns. Values populate correctly for every other 2023 RB (McCaffrey: 1459 rush yds correct, Gibbs: 945 rush yds correct).

3. **Upsert logic has no data loss** (`adapters/nflverse_adapter.py:630-676`) — `ON CONFLICT(player_id, season, week, season_type, source) DO UPDATE SET` overwrites all columns. No GROUP BY, no aggregation, no row deduplication that could lose data.

4. **No filtering by position or production** — The adapter imports every row from the CSV with no minimum-production filter. No `fantasy_relevant` check.

5. **nflverse CSV is the bottleneck** — The source `stats_player_week_2023.csv` from nflverse is missing Bijan Robinson's week 11 data entirely. The 17 available weeks produce 976 rush yards, 4 rush TDs, 214 carries — matching exactly what's in the DB. The missing week 11 accounts for the ~487 yard gap (Robinson had a monster game that week).

6. **Receiving stats are correct** because receiving data for all 17 games IS present in the CSV — only rushing data for week 11 is absent. This asymmetry (correct receiving, wrong rushing, same player, same season) confirms the issue is a row-level gap in the source data, not a column mapping problem.

### Eliminated hypotheses

- ~~Incomplete NEW_FORMAT_COLUMN_MAP~~ — Rushing column names are identical between old and new CSV formats. If the mapping were wrong, ALL rushing stats for ALL players would be affected, but only Bijan's 2023 is wrong.
- ~~Player ID collision~~ — `resolve_player_id()` (line 420-434) uses GSIS ID lookup first. Robinson has a unique GSIS ID.
- ~~Aggregation bug~~ — Season aggregation (lines 1404-1431) SUMs weekly values. The SUM is correct for the weeks that exist.

## Fix Plan

1. **Re-download the latest nflverse CSV** for 2023 — nflverse frequently corrects their data releases. The missing week 11 may have been fixed in a newer release.
   ```bash
   python adapters/nflverse_adapter.py --seasons 2023
   ```
   **File: `adapters/nflverse_adapter.py:1344-1345`** — CLI accepts `--seasons` flag.

2. **Verify after re-import** — Check if Robinson's 2023 rush_yards now equals 1463.

3. **If still missing after re-import**: File an issue on nflverse GitHub (nflreadr/nflfastR) reporting the missing week 11 rushing data for Bijan Robinson 2023.

4. **Add a validation step** — After CSV download, log a warning if any high-profile player has fewer game-weeks than expected for a full season (lines 534-536).

5. **Check 2024 rush TDs** — If 14 vs ~11, verify `season_type = 'regular'` filter is working (line 1429) and playoff rows aren't leaking in.

## Files to Modify

- `adapters/nflverse_adapter.py:534-536` — Add warning log when a player has fewer weeks than expected for a completed season
- Operational: re-run adapter with `--seasons 2023 2024`

## Impact

Bijan Robinson is the #1 dynasty RB. Wrong data for him cascades into every derived metric: PPG, efficiency grades, trade values, breakout scores, dynasty rankings, stock watch, report cards. If a dynasty manager sees his 2023 showing 976 rush yards, they'll screenshot it and post "Razzle's data is broken" on Reddit.

## Acceptance Criteria

- [ ] Bijan Robinson 2023: rush_yards=1463, rush_tds=8, carries=247
- [ ] Bijan Robinson 2024: rush_tds matches regular season only (~11, not 14)
- [ ] Re-import from latest nflverse CSV resolves the gap (or nflverse issue filed)
- [ ] Adapter logs a warning if a star player's season has fewer weeks than expected
- [ ] Spot-check 5 other high-profile players across 2015-2025 for accuracy
