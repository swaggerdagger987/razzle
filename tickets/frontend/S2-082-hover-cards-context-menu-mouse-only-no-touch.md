---
id: S2-082
severity: S2
confidence: HIGH
category: mobile
source: DQ-301,DQ-302,DQ-303
status: OPEN
---

# Hover cards, column resize, and context menu are mouse-only — no touch support

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

Three Lab features are exclusively mouse-dependent with zero touch/pointer event fallbacks:

### 1. Hover Cards (mouseenter/mouseleave only)
- `frontend/lab.js:1864` — inline `onmouseenter="onPlayerNameEnter(...)"` and `onmouseleave="onPlayerNameLeave()"`
- `frontend/lab.js:2288-2293` — `onPlayerNameEnter()`: 300ms delay then `showHoverCard()`
- `frontend/lab.js:2295-2299` — `onPlayerNameLeave()`: 150ms delay then `hideHoverCard()`
- No `touchstart`/`touchend`/`focusin`/`focusout` equivalents exist

### 2. Column Resize (mousedown/mousemove/mouseup only)
- `frontend/lab.js:1649` — `addEventListener("mousedown", _onColResizeStart)`
- `frontend/lab.js:1701` — `_onColResizeStart(e)`: attaches mousemove/mouseup to document
- `frontend/lab.js:1710-1711` — mousemove and mouseup listeners added
- `frontend/lab.js:1716` — `_onColResizeMove(e)`: updates column width
- `frontend/lab.js:1730-1734` — `_onColResizeEnd()`: removes listeners
- No `touchstart`/`touchmove`/`touchend` or `pointerdown`/`pointermove`/`pointerup` equivalents

### 3. Context Menu (right-click only)
- `frontend/lab.js:2539` — global `contextmenu` listener (hides menu on outside click)
- `frontend/lab.js:2591` — table `contextmenu` listener (shows column header context menu)
- No long-press detection for touch devices

## Fix

1. Hover cards: Add tap-to-show on touch devices (detect `ontouchstart` in window), dismiss on second tap or outside tap
2. Column resize: Mirror mouse handlers with `touchstart`/`touchmove`/`touchend` at lab.js:1649/1701/1716/1730
3. Context menu: Add long-press (500ms `touchstart` → `setTimeout`) at lab.js:2591

## Files

- `frontend/lab.js:1864,2288-2299` — hover card mouse handlers
- `frontend/lab.js:1649,1701-1734` — column resize mouse handlers
- `frontend/lab.js:2539,2591` — context menu handlers

## Acceptance Criteria

- Hover cards accessible via touch (tap to show, tap elsewhere to dismiss)
- Column resize works with touch drag
- Context menu available via long-press on mobile
