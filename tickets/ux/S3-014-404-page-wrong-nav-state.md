# S3-014: 404 page shows "The Lab" as active nav item

**Severity**: S3 (Low)
**Category**: ui-bug
**Source**: EDGE-CASES.md #61
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

`frontend/404.html:140` — The 404 page has "The Lab" highlighted as the active nav item, which is incorrect. No nav item should be active on a 404 page.

## Fix

Remove the active class from all nav items on 404.html, or don't apply `nav-active` class to any link.

## Files to Change

- `frontend/404.html:140`

## Accept When

404 page shows no active nav item.
