---
id: DQ-306
title: Lab shows stale data with no indicator when API query fails
priority: P2
category: error-recovery
page: lab.html
---

## Problem
When a screener query fails (API error, timeout, 502), the Lab keeps the previous table data visible (lab.js ~line 1358-1360). A toast notification shows the error, but:

1. The toast auto-dismisses after a few seconds
2. The table still shows previous results with no visual indicator that data is stale
3. The "data freshness" indicator (Phase 104) shows last successful fetch time but doesn't flag "STALE" on error
4. User can make roster decisions based on data from a failed refresh

This is especially dangerous during the current 502 outage — a cached page could show week-old data.

## Expected
After API error: show "Data may be stale" badge next to result count, or dim the table with an overlay showing "Last updated: X min ago — refresh failed."

## Fix
In the `fetchAndRender()` error handler, set a `state.dataStale = true` flag. In `renderResultCount()`, show a warning badge when stale. Clear on next successful fetch.

## Files
- `frontend/lab.js` — `fetchAndRender()` error handler (~line 1358)
- `frontend/lab.js` — `renderResultCount()` freshness display
