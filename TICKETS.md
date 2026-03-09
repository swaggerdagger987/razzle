# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## TICKET 1: Stats Expansion — Play-by-Play Extractions

**Phase Name**: Stats Expansion — Play-by-Play Extractions
**Exit Criterion**: 14 new stats extracted from nflverse play-by-play data and available as Lab columns. Success rate, RYOE, play-action stats, scramble stats, garbage time flags, game script, goal-line stats, two-point conversions, return yards, special teams TDs, intended air yards, drop rate, bye week, and injury data all populated. Deployed to Render.

### Task 1: Extract success rate + RYOE + game script from pbp
**Requirement**: "Update nflverse_adapter.py to extract 3 new stats from play-by-play data: (a) Success Rate: for each player, count plays where EPA > 0, divide by total plays. Separate into pass_success_rate (for QBs) and rush_success_rate (for RBs). Store as decimal 0-1. (b) RYOE (Rush Yards Over Expected): nflverse pbp has an 'expected_yards' or 'xyac_mean_yardage' column. For rushing plays, RYOE = actual yards - expected yards, summed per player per season. Also compute ryoe_per_carry = total_ryoe / carries. (c) Game Script: for each player-season, compute avg_score_differential = mean of score_differential at snap across all plays. Positive = team was winning on average (good game script). Store as a float. Add all new columns to database schema and populate for all seasons."
**Accept when**:
- pass_success_rate and rush_success_rate columns populated (values 0.3-0.6 range)
- RYOE and ryoe_per_carry populated (elite RBs positive, bad RBs negative)
- avg_score_differential populated per player-season
- No regression in existing stats
**Depends on**: none
**Size**: L

### Task 2: Extract play-action + scramble + garbage time stats from pbp
**Requirement**: "Update nflverse_adapter.py to extract 3 more pbp stats: (a) Play-Action stats: filter pbp where is_play_action=True (or qb_dropback with play_action flag). Count play_action_attempts, play_action_completions, play_action_yards, play_action_tds per QB per season. (b) Scramble stats: filter pbp where qb_scramble=1. Count scramble_attempts, scramble_yards, scramble_tds per QB per season. This separates designed runs from scrambles. (c) Garbage Time flag: count plays where abs(score_differential) > 14 in 4th quarter OR abs(score_differential) > 21 in 3rd quarter. Compute garbage_time_pct = garbage_time_plays / total_plays per player-season. Add all columns to schema and populate."
**Accept when**:
- Play-action stats populated for QBs (attempts, completions, yards, TDs)
- Scramble stats populated for QBs (attempts, yards, TDs)
- Garbage time percentage populated for all players
- Scramble yards + designed rush yards ≈ total rush yards for QBs
**Depends on**: none
**Size**: M

### Task 3: Extract goal-line + two-point + return + special teams stats from pbp
**Requirement**: "Update nflverse_adapter.py to extract 4 more pbp stats: (a) Goal-line stats: filter pbp where yardline_100 <= 5. Count gl_carries (rushing plays inside 5), gl_targets (pass targets inside 5), gl_tds (touchdowns inside 5) per player per season. (b) Two-point conversions: filter pbp where two_point_attempt=1. Count two_point_conversions (successful) per player. (c) Return yards: sum return_yards from kickoff and punt return plays per player per season. Also count return_tds. (d) Special teams TDs: count TDs scored on special teams plays (kickoff return TD, punt return TD, blocked kick TD) per player. Add all to schema and populate."
**Accept when**:
- Goal-line carries/targets/TDs populated (values should be small numbers, 0-30 range)
- Two-point conversions populated
- Return yards and return TDs populated
- Special teams TDs populated
- No regression
**Depends on**: none
**Size**: M

### Task 4: Extract intended air yards + drop rate from pbp
**Requirement**: "Update nflverse_adapter.py to extract 2 receiving stats from pbp: (a) Intended Air Yards: sum of air_yards on ALL pass attempts targeted at each receiver (not just completions). The existing air_yards column may only count completions. Ensure this counts all targets. Store as intended_air_yards per player per season. Also compute intended_air_yards_per_target = intended_air_yards / targets. (b) Drop Rate: nflverse pbp may have an incomplete_pass flag combined with other indicators. Count drops as: incomplete_pass=1 AND the receiver was the intended target AND it was a catchable ball (if available). If nflverse doesn't have a clean 'drop' flag, use incomplete_pass where air_yards < 15 and the pass was on target (no interception, no defended) as a rough proxy. Compute drop_rate = drops / targets. Store drops count and drop_rate."
**Accept when**:
- Intended air yards populated per receiver per season
- Intended air yards per target in reasonable range (8-15 for deep threats, 3-6 for slot)
- Drop rate populated as decimal (typical range 0.03-0.12)
- No regression
**Depends on**: none
**Size**: M

### Task 5: Add bye week + injury data from nflverse schedule/roster
**Requirement**: "Pull 2 non-pbp datasets from nflverse: (a) Bye Week: nflverse has schedule data with each team's bye week. For each player, store their team's bye_week (integer 5-14) for each season. Source: nflverse schedules CSV or the schedule endpoint. (b) Injury Data: nflverse has an injuries dataset with weekly injury designations (Out, Doubtful, Questionable, IR). For each player per season, compute: games_missed (weeks with Out or IR designation), injury_designation (most recent designation if any). Source: nflverse injuries CSV. Add both to player data and make available as columns."
**Accept when**:
- Bye week column shows correct bye week per player per season (integer)
- Games missed count populated
- Values spot-checked against known injuries (e.g., a player on IR should show high games_missed)
- No regression
**Depends on**: none
**Size**: M

### Task 6: Wire all new pbp stats as Lab screener columns
**Requirement**: "Add all new stats from Tasks 1-5 as selectable columns in the Lab screener: (a) Advanced category: pass_success_rate (label: 'Pass Succ%'), rush_success_rate (label: 'Rush Succ%'), ryoe_per_carry (label: 'RYOE/Carry'), avg_score_differential (label: 'Game Script'), garbage_time_pct (label: 'Garb%'). (b) Passing category: play_action_yards (label: 'PA Yds'), play_action_tds (label: 'PA TD'), scramble_yards (label: 'Scram Yds'), scramble_tds (label: 'Scram TD'). (c) Rushing category: gl_carries (label: 'GL Carries'), gl_tds (label: 'GL TD'). (d) Receiving category: intended_air_yards_per_target (label: 'IAY/TGT'), drop_rate (label: 'Drop%'), gl_targets (label: 'GL Targets'). (e) General category: return_yards (label: 'Ret Yds'), return_tds (label: 'Ret TD'), two_point_conversions (label: '2PT'), bye_week (label: 'Bye'), games_missed (label: 'Missed'). Add tooltips for all new columns. Update backend queries to include new columns. Show '—' for non-applicable position combos."
**Accept when**:
- All new columns appear in column selector under correct categories
- All columns show real data
- Tooltips present on all new column headers
- '—' for non-applicable stats (e.g., play-action for WRs)
- All sortable
- No regression in existing columns
**Depends on**: Tasks 1-5
**Size**: L

### Task 7: Deploy + smoke test all pbp extractions
**Requirement**: "Verify all play-by-play extracted stats work: (a) All JS passes syntax check. (b) All Python imports clean. (c) Success rate values reasonable (0.3-0.6). (d) RYOE shows positive for elite RBs, negative for bad ones. (e) Play-action and scramble stats populate for QBs only. (f) Goal-line stats are small numbers. (g) Drop rate in 3-12% range. (h) Bye weeks correct for known teams. (i) Return yards populate for returners. Push to master."
**Accept when**: All syntax clean. All new stats show reasonable data. No regression. Committed and pushed to master.
**Depends on**: Task 6
**Size**: S
