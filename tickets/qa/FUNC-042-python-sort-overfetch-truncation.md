# FUNC-042: Python Sort Over-Fetch Truncation in Career Mode

**Severity**: P2
**Flow**: 4 (Screener: Sort)
**Status**: OPEN

## Problem

The Ship Loop added Python-side re-sorting for derived stat columns (yards_per_carry, catch_rate, target_share, etc.) in `fetch_players()`. When the sort key is a derived metric, the query over-fetches rows sorted by PPR total, enriches them with derived stats, then re-sorts in Python. But the over-fetch cap is too low for career mode queries.

### GET /api/players (fetch_players)

Over-fetch cap: `max(limit + offset, 500)`

For early pages (offset < 475), this fetches only 500 rows by PPR total. Players ranked 501+ by PPR are invisible to the derived sort — even if they have the highest catch rate, best YPC, etc.

**Affected counts (career mode):**
- QB: 209 — OK (< 500)
- RB: 472 — OK (< 500)
- WR: 728 — 228 WRs MISSED on pages 1-20
- TE: 382 — OK (< 500)
- All positions: 3,397 — 2,897 players MISSED

### POST /api/screener/query (_fetch_screener_uncached)

Over-fetch cap: `2000` (hardcoded, line 471)

Better, but still truncates all-position career mode (3,397 > 2,000). Single-position career mode is covered for all positions.

**Additional issue in POST endpoint:** Python sort on line 530 overrides `total = len(items)`, hiding the truncation. If 2000 of 3397 players are fetched, UI shows "of 2000" instead of "of 3397". The GET endpoint correctly preserves the SQL total.

## Impact

- Dynasty veteran sorting career WRs by catch_rate, yards_per_target, or any derived stat sees only the best players among the top 500 by PPR total
- A low-volume WR with career-best catch_rate but low PPR total (e.g., a deep threat specialist) would be invisible on page 1
- Practically low-impact because most users filter by single season (< 300 players) and position
- Specific trigger: career mode + WR position + derived stat sort

## Reproduction

```bash
# Sort career WRs by catch_rate — page 1 only shows top catch_rates among top-500-by-PPR WRs
curl "https://razzle.lol/api/players?limit=25&sort=catch_rate&order=desc&position=WR&season=career"
# Compare: total reports 728, but only 500 were considered for the sort
```

## Fix

### GET endpoint (fetch_players, line 193)
Run the count query FIRST, then use total as the SQL limit for python-sorted queries:
```python
# Move count query before main query when python_sort=True
if _python_sort:
    total = conn.execute(count_query, count_params).fetchone()[0]
    sql_limit = min(total, 5000)  # safety cap
    sql_offset = 0
else:
    sql_limit = limit
    sql_offset = offset
```

Or simpler: increase the cap from 500 to 2000 to match the POST endpoint:
```python
sql_limit = max(limit + offset, 2000) if _python_sort else limit
```

### POST endpoint (_fetch_screener_uncached, line 471)
Same fix — use actual total instead of hardcoded 2000. Also fix the total override on line 530 (only override when post_filters modified the count):
```python
if python_sort:
    items.sort(...)
    # Don't override total — keep SQL count (correct even if we truncated)
    # total = len(items)  ← REMOVE THIS LINE
```

## Files

- `backend/live_data/players.py:193` — GET endpoint over-fetch cap
- `backend/live_data/players.py:471` — POST endpoint over-fetch cap
- `backend/live_data/players.py:530` — POST endpoint total override
