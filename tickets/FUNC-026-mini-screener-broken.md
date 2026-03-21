# FUNC-026: Landing page mini-screener doesn't load data

## Severity: P1
## Status: RESOLVED — Ship Loop commit f39dd7b fixed data.items + full_name. Working on running server. Not pushed to origin yet. Verified session 32.

## Summary

The live mini-screener on the landing page (CEO review ticket 002) shows "couldn't reach the film room" instead of real player data. The JS code has two data mapping bugs that cause it to crash silently.

## Evidence

```
Browser test: node functional-qa/browse.js text "#miniScreenerRows" index.html
Result: "couldn't reach the film room. open the screener directly."

API response format: { count: 1997, season: 2024, items: [...] }
Each player: { full_name: "Lamar Jackson", position: "QB", ppg: 25.3, games: 17, age: null }
```

## Root Cause

`frontend/index.html:1012`:
```javascript
_miniData = (data.players || data || []).map(function(p) {
    return {
        name: p.display_name || p.name || '',
```

Two bugs:
1. **`data.players`** is undefined (API returns `data.items`). Falls through to `data` (the response object), which is not an array. `.map()` throws TypeError on a non-array. Caught by `.catch()`, showing error fallback.
2. **`p.display_name || p.name`** — API returns `p.full_name`, not `display_name` or `name`.

## Fix

```javascript
// Line 1012 — fix response key and player name field
_miniData = (data.items || data.players || data || []).map(function(p) {
    return {
        name: p.full_name || p.display_name || p.name || '',
```

## Impact

The mini-screener was the CEO review's #1 ask — replace static mockup with live data. Without this fix, the landing page shows an error message where the product's main demo should be.

## Files
- `frontend/index.html:1008-1027` (mini-screener fetch + data mapping)

## Verified On
- Local: "couldn't reach the film room" (API returns items, JS expects players)
- Prod: `#miniScreenerRows` element not found (CEO changes not deployed yet, but code bug exists)
