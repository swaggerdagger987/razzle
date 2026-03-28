# S3-011: ~40 hardcoded error messages bypass razzleError() voice

**Severity**: S3 (Low)
**Category**: brand-voice
**Source**: EDGE-CASES.md #51
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

~40 error messages across `frontend/lab-panels.js` (31 instances) and 14 standalone HTML files use generic strings like "could not load X" instead of the branded `razzleError()` function which provides agent-voiced, personality-rich error copy.

Pattern: `el.innerHTML = '<p>Could not load data.</p>'` instead of `el.innerHTML = razzleError('panel-name')`.

## Fix

Replace hardcoded error strings with `razzleError()` calls. The function already exists and returns branded error copy like "the film room projector jammed. give it another shot."

## Files to Change

- `frontend/lab-panels.js` — ~31 occurrences (search for `Could not load` or `Error loading`)
- 14 standalone HTML files — search for similar patterns

## Accept When

All error states use `razzleError()` or equivalent branded copy. Zero instances of generic "could not load" or "error loading" text.
