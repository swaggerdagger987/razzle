# S3-013: openManageSubscription() uses browser alert() — breaks brand voice

**Severity**: S3 (Low)
**Category**: ux-flow
**Source**: EDGE-CASES.md #44
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

`frontend/app.js:857-873` — `openManageSubscription()` uses the browser's native `alert()` dialog for error cases. Native alerts break the comic-strip brand voice and can't be styled.

## Fix

Replace `alert()` with `showToast()` calls using branded copy:
```javascript
// Before:
alert("Could not open billing portal. Please try again.");

// After:
showToast("the billing portal is napping. give it another shot.", "error");
```

## Files to Change

- `frontend/app.js:857-873` — replace alert() with showToast()

## Accept When

Zero instances of `alert()` in app.js. All user-facing messages use toast or modal.
