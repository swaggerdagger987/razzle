# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 125 (QA + UX Audit Fixes for Phases 121-124)
## Phase 125: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: 2 HIGH + MEDIUM fixes all resolved. 34 tests pass.

- Task 1: PASS
- Task 2: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: HIGH — Popover scroll dismiss + Escape stopPropagation
**Status**: PASS
**Attempts**: 1
**Result**: Added scroll listener on .table-wrap to dismiss popover. Added e.stopPropagation() in _colStatsEscDismiss. Added _colStatsScrollDismiss function + cleanup in dismissColumnStatsPopover.

### Task 2: MEDIUM — Dedup filters, cache key, rename Leaders to Top 3, shortcuts hint, position context
**Status**: PASS
**Attempts**: 1
**Result**: Filter dedup check before push. Cache key extended with sortKey+season. Button renamed "Leaders" → "Top 3". Shortcuts modal: "Stat cell → copy value" → "Stat cell → add filter from value". Position context label in popover title.
