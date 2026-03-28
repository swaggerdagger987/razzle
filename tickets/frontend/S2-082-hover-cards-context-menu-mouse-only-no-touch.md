---
id: S2-082
severity: S2
confidence: HIGH
category: mobile
source: DQ-301,DQ-302,DQ-303
status: OPEN
---

# Hover cards, column resize, and context menu are mouse-only — no touch support

## Root Cause

Three Lab features are inaccessible on mobile/touch devices:

1. **DQ-301**: Player hover cards use `mouseenter`/`mouseleave` events. Touch users have no way to see hover card content.

2. **DQ-302**: Column resize uses mouse drag events only. Touch users cannot resize columns.

3. **DQ-303**: Context menu uses `contextmenu` event (right-click). Touch users have no long-press alternative.

## Fix

1. Hover cards: Add `focusin`/`focusout` as alternative triggers, or show on tap (dismiss on second tap)
2. Column resize: Add touch event handlers (touchstart/touchmove/touchend)
3. Context menu: Add long-press detection (500ms touch-hold)

## Files

- `frontend/lab.js` — hover card event handlers (~line 2249)
- `frontend/lab.js` — column resize handlers
- `frontend/lab.js` — context menu handler

## Acceptance Criteria

- Hover cards accessible via touch (tap to show, tap elsewhere to dismiss)
- Column resize works with touch drag
- Context menu available via long-press on mobile
