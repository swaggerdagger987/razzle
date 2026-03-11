# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 85 (Screener Group Header Click to Toggle)
## Phase 85: Screener Group Header Click to Toggle
**Exit Criterion**: Clicking a group name in the column group header row toggles all columns in that group on/off. If most are visible, hides all. If most are hidden, shows all. Toast confirms. Columns inserted in definition order.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate → QA+UX audit (phase 85 is multiple of 5)

### Task 1: Group header toggle
**Status**: PASS
**Attempts**: 1
**Result**: Added onclick to group header th elements calling toggleColumnGroup(). Function finds all columns in the group, checks visibility ratio, and toggles all. New columns inserted in definition order. Toast feedback. Cursor pointer + title tooltip. 34 tests pass.
