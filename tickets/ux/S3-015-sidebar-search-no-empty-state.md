# S3-015: Lab sidebar search has no "no results" empty state

**Severity**: S3 (Low)
**Category**: ux-flow
**Source**: EDGE-CASES.md #63
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

`frontend/lab.html:4435-4464` — When sidebar search finds no matching panels, the panel list just goes empty with no feedback. User doesn't know if their search failed or the feature doesn't exist.

## Fix

When search filters result in zero visible panels, show:
```html
<div class="sidebar-empty">nothing matches that search, coach.</div>
```

## Files to Change

- `frontend/lab.js` or `frontend/lab.html` — sidebar search filter logic

## Accept When

Typing a non-matching search term in the sidebar shows a branded "no results" message.
