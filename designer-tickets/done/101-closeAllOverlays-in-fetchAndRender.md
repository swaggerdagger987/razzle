<!-- PM: ready -->
---
id: DQ-412
parent: RC-002 (Lab Interaction Lifecycle)
priority: P1
area: frontend/lab.js
section: interaction lifecycle
type: bug fix
status: open
depends_on: DQ-413 (100-fix-closeAllOverlays-coverage)
---

# Call closeAllOverlays() from fetchAndRender()

**File**: `frontend/lab.js`

## What's wrong

When the Lab re-renders (new data fetched after filter/sort/page change), floating UI from the previous render persists. Hover cards, context menus, and popovers reference stale rows that no longer exist in the DOM.

## What to do

1. Find `fetchAndRender()` in lab.js
2. Add `closeAllOverlays()` as the first line inside the function, before any async work
3. This ensures all floating UI is dismissed before the table is rebuilt

## Accept when

- Changing filters, sort, or page always dismisses all floating overlays
- No orphaned popovers after rapid filter changes
- No JS errors from overlays referencing removed DOM nodes

## Depends on

DQ-413 (100) must be done first — closeAllOverlays() needs to cover all overlay types before we wire it into fetchAndRender.
