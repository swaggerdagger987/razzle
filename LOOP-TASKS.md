# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 58 (Screener Stats Summary Bar)
## Phase 58: Screener Stats Summary Bar
**Exit Criterion**: Screener table has a sticky footer row showing average values for each visible numeric column. A key toggles on/off. Toolbar "Summary" button with active state. Off by default. State persists in localStorage. URL serialization (?summary=1). Works in NFL, college, and prospect modes. Shows player count in the Player column. Sticky bottom positioning. Dense mode support.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Stats summary bar with toggle and persistence
**Status**: PASS
**Attempts**: 1
**Acceptance**: tfoot shows average for each numeric column. Non-numeric/sparkline/notes columns show empty. Player cell shows count. A key toggles. Toolbar "Summary" button shows active state. Off by default (localStorage razzle_summary_bar). URL param ?summary=1. Works in all three modes. Shortcut reference updated. Sticky bottom. Dense mode reduces padding.
**Result**: Added renderSummaryBar() computing averages from state.items, state.summaryBar, toggleSummaryBar(), tfoot element, CSS for sticky summary bar, toolbar button, A keyboard shortcut, URL param, shortcut reference entry, init sync. Wired into renderNFLTable, renderCollegeTable, renderProspectTable.
