---
id: FUNC-009
severity: P2
flow: 27 (Matchup Heatmap)
status: OPEN
file: backend/live_data/analytics.py
function: fetch_matchup_heatmap
created: 2026-03-20
---

# P2: Matchup heatmap includes playoff games — unequal game counts across teams

## What's broken

The matchup heatmap query counts ALL weeks (regular season + playoffs) when computing defensive PPG allowed. This creates unequal game counts across teams:

- Non-playoff teams: 17 games (correct)
- Wild Card losers: 18 games
- Divisional losers: 19 games
- Conference Championship losers: 20 games
- Super Bowl teams: 21 games (PHI)

PPG = total_ppr / games. Teams with more games get their PPG diluted.

## Evidence

```
PHI: 21 games — RB PPG 15.7 (rank 32, "best" RB defense)
DAL: 17 games — RB PPG 23.1 (rank 12)
BUF: 20 games — KC: 20 games — BAL: 19 games
```

PHI appears as the #32 (best) RB defense partly because their total is divided by 21 games instead of 17.

## Why this matters

A matchup heatmap is used for **weekly start/sit decisions during the regular season**. Including playoff data:
1. Dilutes per-game averages for playoff teams (makes them look like better defenses)
2. Compares apples to oranges (17 games vs 21 games)
3. Playoff opponents tend to be stronger teams, further skewing the data
4. The tool's purpose is regular season lineup decisions — playoff data is irrelevant

## Fix

In `analytics.py:fetch_matchup_heatmap()`, add a week filter to both queries:

**Line 1568** (main query): Add `AND s.week <= 18` to WHERE clause
**Line 1583** (game count query): Add `AND week <= 18` to WHERE clause

Or if `season_type` column exists in `player_week_stats`, use `AND s.season_type = 'REG'`.

## Verification

```bash
curl -s "http://localhost:8000/api/matchup-heatmap?season=2024" | python -c "
import json,sys
data=json.load(sys.stdin)
for t in data['teams']:
    if t['games'] != 17:
        print(f'FAIL: {t[\"team\"]} has {t[\"games\"]} games (expected 17)')
print('All teams should have exactly 17 games')
"
```
