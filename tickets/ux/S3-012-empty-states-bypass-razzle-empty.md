# S3-012: ~30 hardcoded empty states bypass razzleEmpty() voice

**Severity**: S3 (Low)
**Category**: brand-voice
**Source**: EDGE-CASES.md #52
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

~30 empty state messages use generic strings like "no X found" instead of the branded `razzleEmpty()` function. Same pattern as S3-011 but for empty results rather than errors.

## Fix

Replace with `razzleEmpty()` calls which return agent-voiced empty states like "nothing worth your time right now."

## Files to Change

- `frontend/lab-panels.js` — search for "no.*found" or "No data"
- Standalone HTML files — search for similar patterns

## Accept When

All empty states use `razzleEmpty()` or equivalent branded copy.
