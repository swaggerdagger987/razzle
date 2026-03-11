# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 57 (Screener Column Group Headers)
## Phase 57: Screener Column Group Headers
**Exit Criterion**: Screener table shows a spanning group header row above column headers, displaying category names (Fantasy, Passing, Rushing, Receiving, etc.) that span their member columns. G key toggles on/off. Toolbar "Groups" button with active state. On by default. State persists in localStorage. URL serialization (?groups=0 when off). Works in NFL, college, and prospect modes. Hidden when fewer than 2 distinct groups are visible.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Column group header row with toggle and persistence
**Status**: PASS
**Attempts**: 1
**Acceptance**: Group header row spans consecutive columns of the same group. G key toggles. Toolbar "Groups" button shows active state when on. On by default (localStorage razzle_group_headers). URL param ?groups=0 when off. Works in all three modes (NFL/college/prospect). Shortcut reference updated. Group separators with left border. Dense mode reduces group header padding/font. Player/utility columns merged into one spanning cell.
**Result**: Added buildGroupHeaderRow() function computing consecutive group spans from visible columns, state.groupHeaders (default true), toggleGroupHeaders(), CSS for .group-header-row, toolbar button, G keyboard shortcut, URL param, shortcut reference entry, init sync.
