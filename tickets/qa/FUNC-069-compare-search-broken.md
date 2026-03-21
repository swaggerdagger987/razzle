# FUNC-069: Player profile compare search returns no results

**Severity**: P1 — Feature exists in UI but does nothing
**Flow**: 16 (Player comparison)
**Found**: Session 72 (2026-03-21)
**Status**: OPEN

## Description

The "Compare" button on player profile pages (`/player/{id}`) opens a search overlay, but typing a player name never shows results. The search dropdown stays empty regardless of input.

## Root Cause

`frontend/player.js:750` reads `data.players || []` but the `/api/players` endpoint returns `data.items`, not `data.players`.

```javascript
// player.js:750 — BROKEN
var players = data.players || [];  // data.players is undefined → always []

// FIX:
var players = data.items || data.players || [];
```

## Reproduction

1. Go to `/player/00-0033873` (Mahomes)
2. Click "Compare" button
3. Type "Allen" in search box
4. Wait — no results appear

API returns 12 results (`curl /api/players?search=Allen&limit=8` → `{count:12, items:[...]}`), but code looks for `data.players`.

## Evidence

- API response keys: `['count', 'season', 'items']` — no `players` key
- Browser: 0 `.compare-search-item` elements after search
- Screenshot: `functional-qa/screenshots/step-8.png`

## Notes

Pre-existing since Phase 39 (commit 7854e38). Not a Ship Loop regression. The Ship Loop's session 72 XSS fix (inline onclick → data attributes) is correct but doesn't help since no items ever render.
