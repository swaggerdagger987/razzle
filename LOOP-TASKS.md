# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 116 (QA + UX Audit — Auto-Generated Fixes)
## Phase 116: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: 2 HIGH (saved view universe UI + missing state) fixed. All MEDIUM findings resolved.

- Task 1: PENDING
- Task 2: PENDING
- Task 3: PENDING
- Stage: BUILD
- Next: Phase gate

### Task 1: Fix saved view universe UI update
**Status**: PENDING
**Attempts**: 0
**Acceptance**: loadSavedView() calls applyUniverseUI(), populateSeasonSelect(), populateFilterStatSelect(), renderColumnPicker(), renderPresets(), populatePresetSelect(), renderActiveFilters() when universe changes. Switching between NFL/college saved views updates toolbar correctly.

### Task 2: Add missing state fields to saved views
**Status**: PENDING
**Attempts**: 0
**Acceptance**: saveCurrentView() saves sortKey2, sortDir2, heatColors, percentileMode, dataBars, density, columnWidths. loadSavedView() restores all these fields.

### Task 3: MEDIUM findings — grouped fixes
**Status**: PENDING
**Attempts**: 0
**Acceptance**: (a) Save button gets title="Save current screener as a named view". (b) Delete confirmation via confirm() before removing saved view. No other MEDIUM items require code changes.
