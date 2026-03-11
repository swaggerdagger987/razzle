# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 80 (Screener Cell Double-Click to Copy)
## Phase 80: Screener Cell Double-Click to Copy
**Exit Criterion**: Double-click any stat cell to copy its value to clipboard. Toast shows "copied: [value]". Skips non-stat cells (player, rank, notes, sparklines, checkboxes). Uses _fallbackCopy() for non-HTTPS. Shortcut reference updated.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate → QA+UX audit (phase 80 is multiple of 5)

### Task 1: Double-click cell to copy value
**Status**: PASS
**Attempts**: 1
**Result**: Added dblclick event listener on tbody via event delegation. Identifies stat cells by excluding col-player, col-rank, notes-cell, sparkline-cell, pin-cell, and input-containing cells. Copies textContent via clipboard API with _fallbackCopy() fallback. Toast feedback. Shortcut reference updated. 34 tests pass.
