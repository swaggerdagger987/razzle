# DQ-401: Player Profile Overlay Not Closable with Escape Key

**Priority**: P0 (broken)
**Category**: Modal UX
**Page**: lab.html (Screener)

## Problem

The player profile overlay (`profileOverlay`) cannot be closed with the Escape key. The global Escape handler at ~line 10501 in lab.js calls `isAnyOverlayOpen()` which checks for `.filter-modal-overlay.open` elements, but `closeProfile()` (line 6340) is only wired to `onclick` — it does NOT listen for keyboard events.

Power users expect Escape to close every modal/overlay. This is a hard UX regression since other overlays (filter modal, formula overlay) DO close on Escape.

## Fix

In the global keydown handler (~line 10487-10518 in lab.js), add a check for the profile overlay being visible before the generic overlay check. Call `closeProfile()` when Escape is pressed and profile is open.

## Evidence

- `closeProfile(e)` at line 6340 checks `e.target !== e.currentTarget` — click-only guard
- Global Escape handler at line 10501 does not explicitly call `closeProfile()`
- Other overlays (filter modal, formula) correctly close on Escape
