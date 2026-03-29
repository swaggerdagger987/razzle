---
id: S1-017
severity: S1
category: frontend
title: Player profile page may show perpetual loading on production
source: deep-audit
status: open
---

## Problem

The deep audit reports that the player profile page displays "pulling film..." loading state without rendering actual player data when accessed via WebFetch. While the code has error handling, the page may fail silently in production if the API endpoint returns unexpected data or the JavaScript execution context differs from localhost.

## Root Cause (UPDATED 2026-03-29 — code investigation)

**Data fetch** — `frontend/player.js:34-62` (`loadPlayer()` function):
- Line 36: `try {` — catch block starts
- Line 37-38: AbortController with 10s timeout
- Line 39: `fetch(/api/players/${encodeURIComponent(playerId)}/profile)`
- Line 41: `.ok` check — `if (!resp.ok) throw new Error(...)`
- Line 42-43: Validates response isn't empty object
- Line 46-52: Handles missing player (shows "player not found")
- Line 59: `renderPlayerPage(data, page)` — called inside try block
- Line 60-61: Catch handler shows error state via `razzleErrorHTML()`

**CRITICAL BUG — Canvas rendering outside try/catch** — `frontend/player.js:184-187`:
```javascript
requestAnimationFrame(() => {
  drawRadar(seasons, career, pos);
  if (seasons && seasons.length > 1) drawArc(seasons, pos);
});
```
The `requestAnimationFrame()` callback fires AFTER the try/catch in `loadPlayer()` completes. Any error in `drawRadar()` (line 331-419) or `drawArc()` (line 461+) will:
- NOT be caught by the try/catch
- NOT display an error state
- **SILENTLY FAIL** — page appears to load but canvases are blank

**Specific crash risks**:
- `drawRadar()` accesses `seasons[seasons.length - 1]` at line 343 — null seasons crashes
- `drawArc()` accesses `seasons.map()` at line 475 — undefined seasons crashes
- `getCanvasTheme()` returning undefined causes silent canvas failure

**Player ID extraction** — `frontend/player.js:25-31` (`getPlayerIdFromURL()`):
- Supports `/player/{id}` path and `?id={id}` query param
- Returns empty string if neither found

## Fix

1. Wrap the `requestAnimationFrame` callback at `player.js:184-187` in a try/catch that logs errors and shows a fallback message in the canvas container
2. Add null/undefined guards before `seasons[seasons.length - 1]` and `seasons.map()` calls
3. Verify on production with 5+ player IDs

## Accept When

- Player profile loads successfully on production for at least 5 different player IDs
- Empty API response shows a clear error state, not perpetual loading
- Loading timeout transitions to error state after 10 seconds
