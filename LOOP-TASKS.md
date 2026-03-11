# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 103 (Column Quick-Hide via Right-Click)
## Phase 103: Column Quick-Hide via Right-Click
**Exit Criterion**: Right-click column header shows context menu with Hide/Sort Asc/Sort Desc options. 34 tests pass.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Column header context menu
**Status**: PASS
**Attempts**: 1
**Result**: (1) Right-click any sortable column header → context menu with Hide column, Sort Ascending, Sort Descending. (2) Reuses existing screener-context-menu styling. (3) Hide calls toggleColumn(key, false) with toast. (4) Sort options clear secondary sort and trigger fetchAndRender. 34 tests pass.
