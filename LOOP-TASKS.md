# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 111 (QA + UX Audit — Auto-Generated Fixes)
## Phase 111: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: 1 HIGH (Enter preventDefault) fixed. Focus ring thickened to 2px. Filter restore added to auto-save/restore. All MEDIUM findings resolved.

- Task 1: PENDING
- Task 2: PENDING
- Task 3: PENDING
- Task 4: PENDING
- Stage: BUILD
- Next: Phase gate

### Task 1: Add preventDefault to Enter key profile open
**Status**: PENDING
**Attempts**: 0
**Acceptance**: When Enter opens a focused player profile, `e.preventDefault()` is called to prevent double-action from native element focus. No regressions in other Enter behavior.

### Task 2: Thicken row focus ring to 2px
**Status**: PENDING
**Attempts**: 0
**Acceptance**: `.row-focused td` box-shadow uses 2px instead of 1.5px. Visually consistent with design system chunky borders.

### Task 3: Add filters to auto-save/restore state
**Status**: PENDING
**Attempts**: 0
**Acceptance**: `razzle_last_state` in localStorage includes `state.filters`. On restore, filters are reapplied and the filter UI reflects them. URL params still override.

### Task 4: LOW findings — grouped polish
**Status**: PENDING
**Attempts**: 0
**Acceptance**: (a) Position badge uses CSS margin-left instead of `&nbsp;`. No other LOW items require code changes (scroll debounce, DOM cache, focus color are acceptable as-is).
