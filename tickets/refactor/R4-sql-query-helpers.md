---
severity: S3
confidence: HIGH
category: refactor
source: bloat-audit-2026-03-29
---

# R4: Extract repeated SQL query helpers (season fetch + position filter)

## What's Wrong

Two SQL patterns are copy-pasted across all live_data modules:

### Pattern 1: Season fetching (41 occurrences)
```python
row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
_season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())
```

### Pattern 2: Position filtering (35 occurrences)
```python
pos_filter = ""
params = []
if position and position.upper() in ("QB", "RB", "WR", "TE"):
    pos_filter = "AND p.position = ?"
    params.append(position.upper())
```

## The Fix

Add two helper functions to `backend/live_data/core.py`:

```python
FANTASY_POSITIONS = frozenset({"QB", "RB", "WR", "TE"})

def resolve_season(conn, season=None, table="player_week_stats"):
    """Return resolved season int. If season is None/0, returns latest available."""
    if season and season > 0:
        return season
    row = conn.execute(f"SELECT MAX(season) FROM {table}").fetchone()
    return row[0] if row and row[0] else _current_nfl_season()

def build_position_filter(position):
    """Return (sql_fragment, params_list) for position WHERE clause."""
    if position and position.upper() in FANTASY_POSITIONS:
        return "AND p.position = ?", [position.upper()]
    return "", []
```

Then replace each occurrence across all files.

## Files to Modify

1. `backend/live_data/core.py` — Add helpers
2. `backend/live_data/analytics.py` — ~14 replacements
3. `backend/live_data/dashboards.py` — ~9 replacements
4. `backend/live_data/tools.py` — ~10 replacements
5. `backend/live_data/players.py` — ~8 replacements

**Do one file at a time. Run tests after each.**

## Acceptance Criteria

- [ ] `resolve_season()` and `build_position_filter()` exist in core.py
- [ ] All 41 season-fetch patterns replaced with `resolve_season()`
- [ ] All 35 position-filter patterns replaced with `build_position_filter()`
- [ ] `PYTHONPATH=. python -m pytest tests/ -q` passes after each file
- [ ] Line count decreases by 200+ lines total

## Estimated Savings

41 x 3 lines + 35 x 3 lines = **~230 lines eliminated**
