# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 120 (QA + UX Audit — Auto-Generated Fixes)
## Phase 120: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: 3 CRITICAL (dead code, XSS x2) and 4 HIGH (visual state, CSS vars, 1px borders, max views) fixed. MEDIUM findings resolved.

- Task 1: PENDING
- Task 2: PENDING
- Task 3: PENDING
- Stage: IN PROGRESS

### Task 1: Delete old saved views dead code + fix XSS
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Delete old saved views implementation (lines 2964-3097 in lab.js): _getSavedViews, _saveSavedViews, populateSavedViewSelect, saveCurrentView (old), loadSavedView (old), deleteSavedView (old), _openViewManager
- Escape v.name with escapeHtml() and v.id with escapeAttr() in renderSavedViewsList()
- Verify populateSavedViewSelect is not called elsewhere (or move to new implementation)
- 34 tests pass

### Task 2: Restore missing visual state in saved views + add limits/toasts
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Add columnWidths, heatColors, percentileMode, dataBars, density to saveCurrentView()
- Restore those fields in loadSavedView()
- Add max 20 views limit check
- Add toast for save ("View saved: name"), load ("Loaded: name"), delete ("View deleted")
- Add confirm() before delete

### Task 3: MEDIUM + design fixes
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Fix invalid CSS vars: --bg-sand → --bg, --font-data → --font-mono (lab.html:3215)
- Fix 1px borders on DVS badges → 2px (lab.html:3148-3151)
- Replace gradient in heatmap legend with stepped color blocks (lab.html:3696)
- Add aria-label to CSV button
