# S2-060: Player headshot URLs NULL for all players

**Severity**: S2 (Medium)
**Category**: Data Quality
**Source**: functional-qa/results.tsv FUNC-004

## Problem

All player headshot URLs are NULL in the production database. Player profile cards, hover cards, and any UI showing player photos display broken images or fallback placeholders.

## Root Cause

The adapter attempts to populate `headshot_url` from two nflverse CSV sources, but both may lack the column:

1. **Weekly stats CSV** — `adapters/nflverse_adapter.py:448`
   ```python
   headshot = row.get("headshot_url", "")
   ```
   The nflverse `player_stats` CSV may not include `headshot_url` as a column.

2. **Roster CSV** — `adapters/nflverse_adapter.py:813`
   ```python
   headshot = (row.get("headshot_url") or "").strip() or None
   ```
   The nflverse `roster` CSV may not include `headshot_url` either, or the column may have been renamed.

The `players` table schema defines the column at `adapters/nflverse_adapter.py:127`:
```sql
headshot_url TEXT
```

If neither CSV source provides the value, the column stays NULL for all ~2,000+ players.

## Investigation Needed

1. Download a sample nflverse weekly stats CSV and roster CSV — check if `headshot_url` column exists
2. If the column was renamed (e.g., `headshot` vs `headshot_url`), update the `.get()` key
3. If nflverse dropped the column entirely, consider using the ESPN CDN pattern: `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{espn_id}.png`

## Fix

Either:
- Map the correct column name from nflverse CSVs if it exists under a different key
- Add a fallback headshot source (ESPN CDN, Sleeper API avatar, or nflverse player images)
- Run `sync_rosters()` with the correct column mapping

## Acceptance Criteria

1. After adapter runs, `SELECT COUNT(*) FROM players WHERE headshot_url IS NOT NULL` returns > 500
2. Player profile modals show actual headshot images
3. Hover cards show player photos
