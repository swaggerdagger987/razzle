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

## Root Cause

**Data fetch** — `frontend/player.js:37-58`:
- Calls `/api/players/{playerId}/profile`
- Has try/catch with `razzleErrorHTML()` fallback on catch (line 56-58)
- Has HTTP status check (line 38)
- Has player-not-found check (line 42-48)

**Potential failure modes**:
1. API returns 200 with empty/malformed JSON — no explicit check for this
2. CORS or network issues on production that don't throw but return empty response
3. Player ID format mismatch between URL parameter and API expectation

## Fix

1. Verify the player profile page works on production (razzle.lol/player.html?id=00-0039044) with a real player ID
2. Add explicit check for empty/malformed API response body
3. Add a loading timeout (10s) that transitions to error state if data never arrives

## Accept When

- Player profile loads successfully on production for at least 5 different player IDs
- Empty API response shows a clear error state, not perpetual loading
- Loading timeout transitions to error state after 10 seconds
