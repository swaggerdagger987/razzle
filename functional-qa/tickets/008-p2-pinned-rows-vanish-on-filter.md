---
id: FUNC-008
severity: P2
flow: 10 (Screener Pin Player)
status: OPEN
file: frontend/lab.js
function: renderPinnedRows
created: 2026-03-20
---

# P2: Pinned players disappear when filtered out of current result set

## What's broken

When a player is pinned, the pinned row renders from `state.items.find(p => p.player_id === pid)` (line 4486). If the user applies a filter that excludes the pinned player (e.g., pin a WR then filter to QBs), the pinned player vanishes from the pinned section because they're no longer in `state.items`.

The pin ID is still stored in `state.pinnedPlayers` and `localStorage`, but the row data is only available if the player is in the current query result. Changing the filter back to include the player will restore the pinned row.

## Impact

- Dynasty veterans who pin a WR to compare against QBs while filtering will lose their pinned comparison row
- The pin feature's value proposition is "sticky comparison" — but it's only sticky within the same filter context
- Not data-wrong, but frustrating UX

## Expected behavior

Pinned player rows should remain visible regardless of current filters. The pinned player data could be cached separately (e.g., in a `pinnedPlayerData` map) when first pinned, so it survives filter changes.

## Fix suggestion

In `togglePinPlayer()`, when adding a pin, also cache the player object in a separate map:
```javascript
if (!isPlayerPinned(playerId)) {
  const player = state.items.find(p => p.player_id === playerId);
  if (player) _pinnedDataCache[playerId] = player;
}
```

In `renderPinnedRows()`, look up from cache first, then `state.items`:
```javascript
const player = _pinnedDataCache[pid] || state.items.find(p => p.player_id === pid);
```
