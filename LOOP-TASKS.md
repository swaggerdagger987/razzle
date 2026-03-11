# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 120 (QA + UX Audit — Auto-Generated Fixes)
## Phase 120: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: 3 CRITICAL (dead code, XSS x2) and 4 HIGH (visual state, CSS vars, 1px borders, max views) fixed. MEDIUM findings resolved.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Delete old saved views dead code + fix XSS
**Status**: PASS
**Attempts**: 1
**Result**: Deleted 85 lines of dead code (old _getSavedViews, _saveSavedViews, saveCurrentView, loadSavedView, deleteSavedView, _openViewManager). Updated populateSavedViewSelect to use getSavedViews() and IDs. Fixed XSS: escapeHtml(v.name) and escapeAttr(v.id) in renderSavedViewsList.

### Task 2: Restore missing visual state in saved views + add limits/toasts
**Status**: PASS
**Attempts**: 1
**Result**: saveCurrentView now saves heatColors, percentileMode, dataBars, density, columnWidths. loadSavedView restores them + handles __manage__ + legacy column formats. Max 20 limit. Toast for save/load/delete. Confirm on delete.

### Task 3: MEDIUM + design fixes
**Status**: PASS
**Attempts**: 1
**Result**: (a) --bg-sand → --bg, --font-data → --font-mono in column picker. (b) 1px → 2px borders on DVS badges. (c) Gradient replaced with 5-step color blocks in heatmap legend. (d) aria-label on CSV button.
