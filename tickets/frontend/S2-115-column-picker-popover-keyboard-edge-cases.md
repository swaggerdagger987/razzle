---
id: S2-115
severity: S2
confidence: HIGH
category: frontend
source: DQ-411+356+414+424+494
status: OPEN
---

# Column picker, popover, and hover card edge cases — keyboard, listeners, stale DOM

## Problems

1. **Column picker not closed by Escape** (DQ-411) — `isAnyOverlayOpen()` doesn't include the column picker. Pressing Escape while the column picker is open does nothing, even though all other overlays close on Escape.

2. **Column stats popover double-open race condition** (DQ-356) — Rapidly right-clicking different column headers can open multiple popovers simultaneously, leaking scroll event listeners.

3. **Column stats popover scroll listeners stack** (DQ-414) — Each popover open adds a scroll listener to dismiss it, but if the popover is reopened without scrolling first, listeners accumulate.

4. **Hover card `_hoverTimer` fires after table re-render** (DQ-424) — If the table re-renders (pagination, sort) while a hover timer is pending, the callback fires on stale DOM — accessing elements that no longer exist.

5. **Column stats popover has no keyboard focus management** (DQ-494) — No ARIA role, no focus trap, no Escape handler specific to the popover.

## Fix

1. Add column picker to `isAnyOverlayOpen()` check in Escape handler
2. Close existing popover before opening a new one (guard in `_openColStats`)
3. Use a named function for scroll listener and `removeEventListener` before `addEventListener`
4. Clear `_hoverTimer` on table re-render (`clearTimeout` in `renderTableBody`)
5. Add `role="dialog"` and Escape handler to column stats popover

## Files

- `frontend/lab.js` — column picker Escape, hover card timer, popover management
- `frontend/lab.html` — column stats popover

## Acceptance Criteria

1. Escape closes column picker
2. Only one popover open at a time
3. Scroll listeners don't accumulate
4. No stale DOM access from hover timers after re-render
