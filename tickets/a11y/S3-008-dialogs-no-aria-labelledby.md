# S3-008: 19 lab dialogs lack aria-labelledby and focus trapping

**Severity**: S3 (Low)
**Category**: a11y
**Source**: EDGE-CASES.md #58
**WCAG**: 4.1.2, 2.4.3
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

19 dialogs in the Lab (filter modal, column picker, context menu, saved views, shortcuts, etc.) lack `aria-labelledby` attributes and focus trapping. The auth modal (app.js) has both — but JS-generated dialogs in lab.js don't follow the same pattern.

## Fix

For each dialog:
1. Add `role="dialog"` and `aria-labelledby` pointing to the dialog's title element
2. Add focus trapping (tab cycles within dialog, Escape closes)

The auth modal in app.js is the reference implementation.

## Files to Change

- `frontend/lab.js` — all dialog/modal creation functions
- `frontend/lab.html` — any static dialog markup

## Accept When

All Lab dialogs have `role="dialog"`, `aria-labelledby`, and focus trapping.
