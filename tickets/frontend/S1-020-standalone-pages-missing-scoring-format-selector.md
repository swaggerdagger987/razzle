# S1-020: Standalone pages missing scoring format selector

**Severity**: S1 (Major)
**Category**: football-accuracy
**Source**: Deep Audit 2026-03-28, finding S1-007

## Problem

Multiple standalone analytical pages default to PPR scoring with no way to toggle
Half-PPR or Standard. Half-PPR is the most common dynasty format. Users see
PPR-only rankings that may not match their league.

## Root Cause

Pages confirmed missing scoring format selector (with file:line for controls area):

1. `frontend/efficiency.html:302-311` — position tabs + season selector only;
   API call: `/api/efficiency-rankings?limit=30` (no scoring_format param)
2. `frontend/consistency.html:302-311` — same pattern;
   API call: `/api/consistency-rankings?limit=30`
3. `frontend/schedule.html:324-333` — same pattern;
   API call: `/api/strength-of-schedule?limit=30`
4. `frontend/breakouts.html:376-385` — same pattern;
   API call: `/api/breakout-candidates?limit=50`
5. `frontend/buysell.html:430-439` — same pattern;
   API call: `/api/buy-sell-candidates?limit=15`
6. `frontend/scoring.html:292` — season selector only
7. `frontend/breakdown.html:370` — season selector only
8. `frontend/reportcard.html` — position tabs only
9. `frontend/vorp.html` — position tabs only
10. `frontend/stocks.html` — position tabs only

The Lab screener DOES have a scoring format selector:
- `frontend/lab-panels.js:1338-1358` — PPR/Half-PPR/Standard tabs
- API call uses `?format=ppr|half|std`

Backend endpoints also lack scoring_format parameter:
- `backend/server.py:2691` — `efficiency_rankings()`
- `backend/server.py:2704` — `consistency_rankings()`
- `backend/server.py:2717` — `strength_of_schedule()`
- `backend/server.py:2561` — `breakout_candidates()`
- `backend/server.py:2569` — `buy_sell_candidates()`

## Expected

Each page should have a PPR / Half-PPR / Standard toggle (matching the Lab's style)
that passes `scoring_format` to the API endpoint.

## Fix

1. Add scoring format tabs UI to each standalone page (copy pattern from lab-panels.js:1338-1358)
2. Pass `&scoring_format=ppr|half|std` in each page's API call
3. Add `scoring_format` query param handling to backend endpoints
4. Update the underlying `live_data/` functions to filter by scoring format

## Accept When

- At least the top 10 most-visited analytical pages have a scoring format selector
- Switching format re-renders the page with correct values
- Default remains PPR for backwards compatibility
