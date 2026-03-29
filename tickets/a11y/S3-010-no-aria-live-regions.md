# S3-010: Dynamic panel content has no aria-live regions

**Severity**: S3 (Low)
**Category**: a11y
**Source**: EDGE-CASES.md #60
**WCAG**: 4.1.3
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

When Lab panels load data, table content updates dynamically. Screen readers don't announce these changes because no `aria-live` regions are defined.

Key areas that need `aria-live`:
- Lab table body (results update on filter/sort/page change)
- Toast notifications
- Loading/error/empty states

## Fix

Add `aria-live="polite"` to result containers and `aria-live="assertive"` to error messages:
```html
<div id="lab-results" aria-live="polite">...</div>
<div id="toast-container" aria-live="polite">...</div>
```

## Files to Change

- `frontend/lab.html` — add aria-live to results container
- `frontend/app.js` — add aria-live to toast container

## Accept When

Screen reader announces when: table data loads, toast appears, error/empty state shows.
