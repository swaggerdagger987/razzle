<!-- PM: ready -->
---
id: DQ-413
parent: RC-002 (Lab Interaction Lifecycle)
priority: P1
area: frontend/lab.js
section: interaction lifecycle
type: bug fix
status: open
---

# Fix closeAllOverlays() to cover all 5 overlay types

**File**: `frontend/lab.js`

## What's wrong

`closeAllOverlays()` doesn't dismiss all floating UI. When the user triggers a state change (filter, sort, page), stale overlays from the previous state persist:

- Hover cards (player mini-profile popover)
- Column stats popover (right-click header)
- Context menu (right-click row)
- Keyboard shortcut toast
- Any active tooltip

## What to do

1. Find `closeAllOverlays()` in lab.js
2. Ensure it dismisses ALL 5 overlay types listed above
3. Each overlay type should have a null-safe close (check element exists before removing)

## Accept when

- Triggering a filter change dismisses any open hover card, context menu, or column stats popover
- No JS errors when closeAllOverlays() is called with no overlays open
- Manual test: open a hover card, change a filter — hover card disappears
