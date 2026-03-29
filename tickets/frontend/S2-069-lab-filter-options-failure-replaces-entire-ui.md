---
id: S2-069
severity: S2
confidence: HIGH
category: ux-flow
source: DQ-317
status: OPEN
---

# Lab filter-options failure replaces entire UI — unrecoverable

## Root Cause

`frontend/lab.js:1140-1146`: When `/api/filter-options` fails, the error handler replaces the entire Lab content with a single error div:

```js
labContent.innerHTML = '<div style="...">' + razzleError() + '</div>';
```

This destroys the sidebar, toolbar, and table — the user must refresh the page. There's no retry button, no fallback to cached options, and no way to recover.

## Fix

Show the error as a toast or banner within the existing layout, not replacing it:
```js
showToast(razzleError(), "error");
// Optionally populate season/position selects with hardcoded defaults
```

Or add a retry button that re-calls `loadFilterOptions()`.

## Files

- `frontend/lab.js:1140-1146` — filter-options error handler

## Acceptance Criteria

- Filter-options failure shows an error message without destroying the Lab layout
- User can retry or refresh without losing page structure
- Sidebar and toolbar remain functional even if filter options fail
