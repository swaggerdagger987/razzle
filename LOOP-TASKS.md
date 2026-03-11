# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 61 (QA + UX Audit Fixes for Phases 56-60)
## Phase 61: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH QA findings fixed. MEDIUM UX findings addressed. Context menu safe against apostrophe names. Clipboard copy with error handling. Context menu separator consistent across modes. Summary bar label clarified.

- Task 1: PENDING (Fix HIGH-1: Context menu JS injection with apostrophe names)
- Task 2: PENDING (Fix HIGH-2: clipboard.writeText error handling)
- Task 3: PENDING (Fix HIGH-3: Context menu separator for college mode)
- Task 4: PENDING (Fix MEDIUM UX: summary bar label + clear all highlights)
- Stage: IN PROGRESS

### Task 1: Fix context menu JS string injection with apostrophe names
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Right-clicking D'Andre Swift or Ja'Marr Chase shows context menu without JS error. All context menu actions work with names containing apostrophes, quotes, or special characters. Use JS-safe escaping for onclick handler strings.

### Task 2: Fix clipboard.writeText error handling
**Status**: PENDING
**Attempts**: 0
**Acceptance**: "Copy Name" in context menu works on HTTPS and shows "copied" toast. On HTTP or permission denied, shows "copy failed" toast instead of uncaught promise rejection. No console errors.

### Task 3: Fix context menu separator for college/prospect mode
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Right-click context menu in college and prospect modes has a separator between Watchlist and Toggle Highlight, same as NFL mode.

### Task 4: Fix MEDIUM UX issues (summary label + clear highlights)
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Summary bar label says "page avg" instead of "avg". Escape key clears all row highlights (with toast feedback). Context menu has "Clear All Highlights" option when any rows are highlighted.
