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

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

### Column Picker — no Escape, no focus trap, no arrow nav
- **Open/close**: `lab.js:3513-3524` — `openColumnPicker()` / `closeColumnPicker()`
- **Auto-focus**: `lab.js:3516` — search input focused with 50ms delay
- **Dialog role**: `lab.html:3548` — has `role="dialog" aria-modal="true"` but no JS enforcement
- **ESCAPE GAP**: `lab.js:10564-10572` — `isAnyOverlayOpen()` checks filter-modal, colStatsPopover, tagPicker, noteEditor, contextMenu, hoverCard — but **NOT columnPickerOverlay**
- **FOCUS TRAP**: Missing — no keydown handler on overlay, Tab escapes to background
- **ARROW KEYS**: Missing — no keyboard navigation for checkbox list

### Column Stats Popover — no ARIA, no keyboard
- No `role="dialog"` or focus management on the popover element
- Escape key not handled (not in `isAnyOverlayOpen()` either)

## Fix

1. `lab.js:10564-10572` — Add `columnPickerOverlay` to `isAnyOverlayOpen()` checks
2. `lab.js:3513-3524` — Add keydown handler for focus trap (Tab), Escape close
3. Add `role="dialog"` and Escape handler to column stats popover
4. Clear `_hoverTimer` in `renderTableBody` to prevent stale DOM access

## Files

- `frontend/lab.js:3513-3524` — column picker open/close
- `frontend/lab.js:10564-10572` — `isAnyOverlayOpen()` missing column picker
- `frontend/lab.js:10596-10632` — global Escape handler
- `frontend/lab.html:3548-3558` — column picker overlay HTML

## Acceptance Criteria

1. Escape closes column picker
2. Only one popover open at a time
3. Scroll listeners don't accumulate
4. No stale DOM access from hover timers after re-render
