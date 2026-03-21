# FUNC-047: Stale players.team — 237 Players Show Wrong Current Team

**Severity**: P0
**Flow**: 2 (Position filter), 10 (Handcuffs), 13 (Player profile), 20 (Trade Finder), all team-dependent features
**Found**: Session 46 (2026-03-21)
**Status**: OPEN
**Related**: None (new root cause)

## Description

The `players.team` column is frozen at the team each player was first imported with and **never updated** when players change teams. 237 of the ~600 fantasy-relevant players show the wrong current team in the 2025 season.

This affects **every feature on the site** that displays or filters by team:
- Screener team filter returns wrong players (DET filter shows D'Andre Swift who left in 2023, misses Jared Goff who joined in 2021)
- Handcuffs page has completely wrong pairings (McCaffrey paired with CAR backups, Barkley with NYG)
- Quick search, player profiles, trade finder, all cards — all show wrong team
- Team-based analytics (target distribution, etc.) group players wrong

**A dynasty league user filtering by their team's players would get completely wrong results. This would immediately destroy site credibility.**

## Verified Examples

| Player | players.team (shown) | Actual 2025 Team | Wrong Since |
|--------|---------------------|------------------|-------------|
| Jared Goff | LA | DET | 2021 |
| Saquon Barkley | NYG | PHI | 2024 |
| Christian McCaffrey | CAR | SF | 2022 |
| Josh Jacobs | LV | GB | 2024 |
| Tony Pollard | DAL | TEN | 2024 |
| David Montgomery | CHI | DET | 2023 |
| James Conner | PIT | ARI | 2021 |
| Kirk Cousins | WAS | ATL | 2024 |
| Aaron Rodgers | GB | PIT | 2025 |
| Justin Fields | CHI | NYJ | 2025 |

Total mismatches: **237 players** (37 QB, 58 RB, 93 WR, 49 TE)

## Root Cause

**adapters/nflverse_adapter.py:445**:
```python
conn.execute("""
    INSERT OR IGNORE INTO players (player_id, full_name, first_name, last_name,
        search_name, position, team, gsis_id, headshot_url, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (player_id, name, first, last, normalize_name(name), pos, team, gsis, headshot, utc_now()))
```

`INSERT OR IGNORE` means if the player_id already exists, the row is completely skipped. Team is never updated. The only post-insert UPDATE is for headshot_url (line 451), not team.

## Fix

Add an UPDATE after the INSERT OR IGNORE to refresh team data from latest import:

```python
# After the INSERT OR IGNORE on line 448:
conn.execute("""
    UPDATE players SET team = ?, updated_at = ?
    WHERE player_id = ? AND (team IS NULL OR team != ?)
""", (team, utc_now(), player_id, team))
```

This ensures that every time we see a player in a new season's data, their team gets updated.

**Alternative quick fix** — add a post-sync migration that updates `players.team` from the most recent `player_week_stats`:

```sql
UPDATE players SET team = (
    SELECT s.team FROM player_week_stats s
    WHERE s.player_id = players.player_id
    ORDER BY s.season DESC, s.week DESC LIMIT 1
)
WHERE player_id IN (
    SELECT DISTINCT player_id FROM player_week_stats
);
```

## Impact Scope

`p.team` (from stale `players` table) is used in:
- `players.py:53` — main fetch_players (screener display)
- `players.py:560` — filter-options team dropdown
- `players.py:630,639,657,689` — player profiles
- `players.py:852,1368,1465,1560,1628,1802,1823,1842` — various queries
- `tools.py:1852` — handcuffs grouping (groups by stale team, creates completely wrong pairs)
- Target distribution — groups by `p.team`, so DET includes D'Andre Swift's 2025 stats from his ACTUAL team, corrupting DET carry/target share calculations
- Opportunity share — shows McCaffrey as CAR, not SF
- Records — all career records show stale team
- All analytics queries that JOIN on `players`

Total: 15+ SQL queries across the backend

**Note**: This doesn't just affect display — it **corrupts team-level calculations** (carry shares, target shares, handcuff pairings) because players from different actual teams are grouped together.

## Verification

1. After fix, run: `SELECT full_name, team FROM players WHERE full_name = 'Jared Goff'` → should show DET
2. `GET /api/players/quick-search?q=goff` → team should be DET
3. Screener with `teams=["DET"]` should return Goff, Montgomery, and NOT return Swift/Stafford
4. `GET /api/handcuffs?season=2025` → McCaffrey should show under SF, not CAR
5. Verify all 237 mismatches are resolved
