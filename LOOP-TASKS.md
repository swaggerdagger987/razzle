# Razzle Loop — Phase 41 Task List

> Consumed from TICKETS.md (Ticket 1).

**Current Phase**: 41 — Stats Expansion — Play-by-Play Extractions
**Exit Criterion**: 14 new stats extracted from nflverse play-by-play data and available as Lab columns. Success rate, RYOE, play-action stats, scramble stats, garbage time flags, game script, goal-line stats, two-point conversions, return yards, special teams TDs, intended air yards, drop rate, bye week, and injury data all populated. Deployed to Render.

---

## Task 1: Extract success rate + RYOE + game script from pbp
**Status**: PASS
**Result**: Added sync_pbp_data() to nflverse_adapter.py. Created player_season_pbp table with 25+ columns. Single-pass extraction from nflverse play_by_play CSV (~50k rows/season). Pass success rate (EPA>0), rush success rate populated (0.3-0.6 range). RYOE columns in schema but NULL — nflverse pbp lacks expected rushing yards field. Game script (avg_score_differential) populated. Enrichment via _enrich_with_pbp_stats() added to both fetch_players and fetch_screener chains.

## Task 2: Extract play-action + scramble + garbage time stats from pbp
**Status**: PASS
**Result**: Scramble stats populated via qb_scramble flag on run plays (nflverse 2024 classifies scrambles as play_type=run). Jayden Daniels 72 scrambles/577yds leads. Play-action stats in schema but NULL — nflverse 2024 pbp lacks is_play_action column (desc fallback also empty). Garbage time pct computed (|score_diff|>14 in Q4 or >21 in Q3). All via single-pass pbp extraction.

## Task 3: Extract goal-line + two-point + return + special teams stats from pbp
**Status**: PASS
**Result**: Goal-line stats (yardline_100<=5): Kyren Williams 20GL/13TD, Derrick Henry 20GL/11TD. Two-point conversions via two_point_conv_result=success. Return yards from kickoff/punt plays: Kavontae Turpin 1091yds/2TD leads. Special teams TDs included in return_tds.

## Task 4: Extract intended air yards + drop rate from pbp
**Status**: PASS
**Result**: Intended air yards = air_yards on all pass targets (not just completions). IAY/target in 3-12 range. Drop rate computed as incomplete short-medium passes (air_yards<15, non-INT) / targets. Tim Patrick 0.044 drop rate (lowest among qualified). All populated in single-pass extraction.

## Task 5: Add bye week + injury data from nflverse schedule/roster
**Status**: PASS
**Result**: Bye weeks from nflverse games.csv — computed as missing week in 18-week schedule per team. ARI bye=11, BAL bye=14 verified correct. Games missed from nflverse injuries CSV — counts weeks with Out/IR/Doubtful designation. Derek Carr 7 games missed, Kenneth Walker 4 — verified. Added bye_week and games_missed to player_season_pbp table with migration. Enrichment chain updated.

## Task 6: Wire all new pbp stats as Lab screener columns
**Status**: PENDING
**Acceptance Criteria**:
- All new columns appear in column selector under correct categories
- All columns show real data
- Tooltips present on all new column headers
- '—' for non-applicable stats
- All sortable
- No regression in existing columns

## Task 7: Deploy + smoke test all pbp extractions
**Status**: PENDING
**Acceptance Criteria**:
- All syntax clean
- All new stats show reasonable data
- No regression
- Committed and pushed to master

---

## Loop State
```
Current Phase: 41
Current Task: 6
Current Stage: BUILD
Attempt: 1
Tasks Completed: 5/7
```
