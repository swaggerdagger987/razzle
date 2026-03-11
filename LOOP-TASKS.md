# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 114 (Column Reorder by Drag)
## Phase 114: Column Reorder by Drag
**Exit Criterion**: Users can drag data column headers to reorder columns. Drag ghost follows mouse. Column order persists in state. Frozen columns (star/select/pin/rank/player) are not draggable. 34 tests pass.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Implement column drag reorder
**Status**: PASS
**Attempts**: 1
**Result**: (1) HTML5 drag-and-drop on data column headers. (2) Dragging column shows 0.4 opacity on source, terracotta left border on drop target. (3) Frozen columns have no draggable attr. (4) Reorder updates visibleColumns/collegeColumns/prospectColumns and re-renders head+body. (5) Resize handle mousedown blocked from initiating drag. (6) State saved via saveStateToURL() (localStorage persist). 34 tests pass.
