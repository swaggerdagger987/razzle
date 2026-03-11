# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 67 (Screener Sort Column Highlight + Row Rank)
## Phase 67: Screener Sort Column Highlight + Row Rank
**Exit Criterion**: Sorted column has a subtle background tint on all data cells. A narrow "#" rank column shows overall rank (1, 2, 3...) adjusting for pagination offset. Both work in NFL, college, and prospect modes.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Sort column highlight + row rank column
**Status**: PASS
**Attempts**: 1
**Result**: Added sort-col CSS class (rgba terracotta 5% tint) on sorted column data cells, th.sort-asc/desc gets 8% tint. Row rank # column with col-rank class (36px), shows state.offset+rowIdx+1. Updated colspans in group headers (+1), summary bar (+1), tier breaks (+1). Pinned rows show empty rank. Heat colors override sort highlight correctly.
