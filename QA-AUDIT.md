# QA + UX Audit — Phases 111-115

**Audit Date**: 2026-03-11
**Scope**: Phases 111-115 (QA fixes, Column resize, Onboarding toast, Column reorder, Saved views)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH

1. **Saved view load doesn't update universe UI** (`frontend/lab.js:loadSavedView`)
   - When loading a saved view that changes the universe (e.g., NFL → college), `loadSavedView()` sets `state.universe` but does NOT call `applyUniverseUI()`, `populateSeasonSelect()`, `populateFilterStatSelect()`, `renderColumnPicker()`, `renderPresets()`, `populatePresetSelect()`, or `renderActiveFilters()`. The toolbar, position tabs, season dropdown, and body classes remain stale. The table renders correctly but the UI is broken.
   - **Fix**: Call the same UI update functions that `setUniverse()` calls after state restore.

2. **Saved views missing state fields** (`frontend/lab.js:saveCurrentView`)
   - `saveCurrentView()` does not save: `sortKey2`, `sortDir2` (multi-sort), `heatColors`, `percentileMode`, `dataBars`, `density`, `columnWidths`. A user who configures multi-sort and visual modes then saves a view will lose those settings on load.
   - **Fix**: Include all missing state fields in the saved view object.

### MEDIUM

3. **Column resize only applies to `<th>` elements** (`frontend/lab.js:_onColResizeMove`)
   - The resize handler queries `th[data-col="key"]` to update widths, but `<td>` cells don't have `data-col`. With `width: max-content` on the table, `<th>` min/max-width constraints should propagate to columns, but content wider than the set width may overflow. Should be tested with long stat values.

4. **Onboarding toast timer leaks** (`frontend/lab.js:init`)
   - The 3s delay and 8s auto-dismiss timers are set but never stored. If the user navigates away before they fire, the toast appends to a stale DOM. Not harmful but technically a leak.

### LOW

5. **Column drag `draggable="true"` may interfere with text selection in headers** — Minor UX impact since headers are short labels.

6. **Saved view name prompt uses native `prompt()`** — Functional but not in Razzle design language. Could use a styled modal in the future.

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **Save button not obvious** (toolbar)
   - The "Save" button next to "Views..." dropdown has no visual differentiation from other toolbar buttons. A new user wouldn't know it saves the current view. Consider adding a small bookmark/save icon or tooltip.

2. **No confirmation before deleting a saved view** (`_openViewManager`)
   - Clicking "Delete" immediately removes the view with only a toast notification. For views a user has carefully configured, accidental deletion could be frustrating. Consider a simple confirm() or undo toast.

### LOW

3. **Onboarding toast positioning may overlap bulk action bar** — Toast is bottom-right (32px), bulk bar is bottom-center. Unlikely overlap but possible on narrow screens.

4. **Column resize cursor sometimes persists** — If mouseup fires outside the browser window, `_onColResizeEnd` may not trigger. The `document.mouseup` handler should catch this, but edge cases exist with iframe boundaries.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 2 (saved view universe UI + missing state fields)
- **MEDIUM**: 4 (resize <td>, timer leak, save button, delete confirm)
- **LOW**: 4 (drag text select, native prompt, toast overlap, cursor persist)

Code quality is solid but saved views need work on state completeness and universe switching.
