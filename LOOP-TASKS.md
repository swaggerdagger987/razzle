# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 68 (Screener Rows Per Page Selector)
## Phase 68: Screener Rows Per Page Selector
**Exit Criterion**: Dropdown near pagination lets users choose 25/50/100/200 rows per page. Selection persists in localStorage. Pagination resets to page 1 on change. Works in all modes.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Rows per page selector
**Status**: PASS
**Attempts**: 1
**Result**: Added select-chunky dropdown (25/50/100/200) next to pagination. state.limit initialized from localStorage (razzle_page_size). changePageSize() resets offset to 0 and persists. renderPagination() syncs select value.
