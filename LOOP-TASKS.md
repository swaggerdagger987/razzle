# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 61 (QA + UX Audit Fixes for Phases 56-60)
## Phase 61: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH QA findings fixed. MEDIUM UX findings addressed.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Task 4: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Fix context menu JS string injection with apostrophe names
**Status**: PASS
**Attempts**: 1
**Result**: Rewrote context menu to use data attributes + _ctxMenuAction() switch instead of inline onclick strings. Player data stored in _ctxMenuData variable. No more escapeAttr in JS string context.

### Task 2: Fix clipboard.writeText error handling
**Status**: PASS
**Attempts**: 1
**Result**: Wrapped navigator.clipboard.writeText in try/catch with .then()/.catch() handlers. Shows "copy failed" toast on error.

### Task 3: Fix context menu separator for college/prospect mode
**Status**: PASS
**Attempts**: 1
**Result**: Moved separator outside NFL conditional — now always present before utility actions (highlight, copy).

### Task 4: Fix MEDIUM UX issues (summary label + clear highlights)
**Status**: PASS
**Attempts**: 1
**Result**: Summary bar label changed to "page avg" with tooltip. Escape key clears all highlights with toast. Context menu shows "Clear All Highlights" when any rows highlighted.
