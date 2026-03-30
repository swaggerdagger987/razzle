---
id: DQ-375
title: Player comps returns empty with no user-facing explanation when player has <4 games
priority: P2
category: UX / empty state
page: Lab screener (comp finder panel)
status: open
cycle: 49
---

## Problem

The player comp finder requires a player to have at least 4 games in a season to generate comparisons (players.py:1830, 1849). When a player has fewer games, the API returns `{"comps": [], "player": {...}}` with no indication WHY.

The user searches for a rookie with 2 games played, sees "no comps found", and has no idea why. They might think the feature is broken or the player isn't in the database.

## Evidence

- `backend/live_data/players.py:1830`: Silently filters to players with `gp >= 4`
- `backend/live_data/players.py:1849`: Returns empty comps array if target player has <4 games
- No "reason" or "message" field in the response to explain the threshold

## Fix

1. In `players.py`, when player has <4 games, include a reason field:
```python
if player_stats.get('gp', 0) < 4:
    return {"comps": [], "player": player, "message": "needs 4+ games for reliable comps"}
```

2. In the frontend comp finder panel, show the message when comps are empty:
```
"[Player] has only 2 games this season. Comps need 4+ games to be meaningful."
```

Use Caveat font for the explanation (it's an aside/annotation per DESIGN.md).

## Verification

Search for a player with <4 games in the comp finder. Should see a clear explanation instead of empty results.
