---
id: DQ-370
title: Season selector initialization varies across standalone pages — fragmented pattern
priority: P3
category: UX / consistency
page: dashboard.html, tradevalues.html, breakouts.html, weekly.html, aging.html (systemic)
cycle: 47
---

## Problem

Each standalone page initializes its season selector differently:

- **dashboard.html**: populates AFTER first fetch if `options.length <= 1` (line 465)
- **tradevalues.html**: populates AFTER first fetch if `options.length === 0` (line 671), then sets selected value (line 678)
- **breakouts.html**: clears with `innerHTML = ''` first (line 536), then rebuilds from API response
- **weekly.html**: calls shared `populateSeasons()` helper (line 462)
- **aging.html**: calls shared `populateSeasons()` helper (line 743)

Some pages use a shared helper, others have inline logic. Some clear-and-rebuild, others append-if-empty. Some check `options.length <= 1`, others check `=== 0`.

## Impact

When a new season starts (e.g., 2026), some pages will auto-update and others may show stale defaults depending on which initialization path they use. No single fix point.

## Not a duplicate of

- DES-312 (pending): season select missing aria-label (accessibility, not initialization logic)

## Fix

Create a shared `initSeasonSelector(selectEl, seasons, defaultSeason)` function in app.js and replace all 5 inline patterns. This ensures one code path handles: clearing, populating, default selection, and empty fallback.

## Files
- `frontend/dashboard.html` (line 465)
- `frontend/tradevalues.html` (lines 671, 678)
- `frontend/breakouts.html` (lines 534-543)
- `frontend/weekly.html` (line 462)
- `frontend/aging.html` (line 743)
- All other standalone pages with season selectors
