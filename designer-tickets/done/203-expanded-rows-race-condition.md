<!-- PM: ready -->
---
id: DQ-414
parent: RC-002 (Lab Interaction Lifecycle)
priority: P2
area: frontend/lab.js
section: interaction lifecycle
type: bug fix
status: open
---

# Fix expanded rows race condition on re-render

**File**: `frontend/lab.js`

## What's wrong

When a user expands a row (click rank # for weekly breakdown) and then triggers a re-render (filter change, sort, page), the expanded row state is not cleared. This causes:

- Expanded row content referencing a player who is no longer in the results
- Visual glitches where expansion arrows point to wrong rows
- Potential JS errors if the expanded row's DOM node was removed during re-render

## What to do

1. Find the expanded row state tracking in lab.js (likely a Set or variable tracking expanded row IDs)
2. Clear expanded row state at the start of `fetchAndRender()` or in `closeAllOverlays()`
3. Ensure any expanded row DOM elements are cleaned up before new rows are rendered

## Accept when

- Changing filters/sort/page collapses all expanded rows
- No visual artifacts from stale expanded row state
- No JS errors when re-rendering with previously expanded rows
