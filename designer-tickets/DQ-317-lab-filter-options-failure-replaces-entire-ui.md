---
id: DQ-317
title: Lab filter-options API failure replaces entire UI with error — no retry possible
priority: P2
category: error-recovery
page: lab.html
---

## Problem
In lab.js init (~lines 1127-1138), if `/api/filter-options` fails, the error handler replaces the entire labContent div with an error message. The toolbar, sidebar, and skeleton all disappear. User has no retry button and no way to interact with the Lab at all.

This is different from DQ-306 (screener query failure), which correctly shows a toast with retry button while keeping the table visible. The filter-options failure is MORE destructive — it wipes the entire page.

## Expected
On filter-options failure: show error toast with retry button (matching the screener query error pattern), keep the Lab UI skeleton visible, and fall back to hardcoded default filter options (["2025"], ["QB","RB","WR","TE"], etc.).

## Fix
- `frontend/lab.js` ~line 1128: change error handler from `labContent.innerHTML = error` to `_showToast(error, retryFunction)` + fall back to sensible defaults
- Keep skeleton/toolbar visible so user can click retry

## Files
- `frontend/lab.js` — init filter-options error handler (~line 1128)
