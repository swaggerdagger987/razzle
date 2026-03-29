---
id: S3-086
severity: S3
confidence: MEDIUM
category: data-gap
source: BUG-003
status: OPEN
---

# Handcuff Rankings panel has no data for 2025 season

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Endpoint**: `backend/server.py:3258-3264` — `GET /api/handcuffs`
**Handler**: `backend/live_data/tools.py:1840-1935` — `fetch_handcuffs()`

The function at `tools.py:1851-1855` queries available seasons from `player_week_stats`:
```python
available_seasons = [r[0] for r in cursor.execute(
    "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
).fetchall()]
```
If `season` param is empty, defaults to `available_seasons[0]` (latest available).

The handcuffs are derived via heuristic — NOT manually curated. The function queries rush attempts, snap counts, and target share to identify backup RBs. But if 2025 season data hasn't been imported into `player_week_stats`, the endpoint falls back to the latest available season (e.g., 2024).

## Fix

1. Import 2025 season data via `python adapters/nflverse_adapter.py --seasons 2025`
2. Alternatively, show branded empty state when requested season has no data
3. No manual curation needed — the heuristic approach works

## Files

- `backend/server.py:3258-3264` — endpoint handler
- `backend/live_data/tools.py:1840-1935` — `fetch_handcuffs()` function
- `adapters/nflverse_adapter.py` — season data import

## Acceptance Criteria

- Handcuff Rankings panel shows data for 2025 (either curated or heuristic)
- OR panel shows branded empty state explaining the gap
