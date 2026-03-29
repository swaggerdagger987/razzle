# S1-025: Keyboard shortcuts fire while overlays open, causing modal stacking

**Severity**: S1 (High)
**Category**: frontend
**Source**: designer-tickets/DQ-422
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab.js:10594` — The main keydown handler has an `isAnyOverlayOpen()` guard function (line 10564-10572) but it's **only used for Escape key handling** (line 10614). All other keyboard shortcuts (H, D, T, G, A, S, C, F, M, W, E, X, ?, 1-5, etc.) fire without checking if an overlay is open.

```javascript
// lab.js:10564-10572 — guard exists but unused
function isAnyOverlayOpen() {
  if (document.querySelector('.filter-modal-overlay.open')) return true;
  if (document.getElementById('colStatsPopover')) return true;
  if (_tagPickerVisible) return true;
  if (_noteEditorVisible) return true;
  if (document.getElementById('screenerContextMenu')) return true;
  if (_hoverCardVisible) return true;
  return false;
}

// lab.js:10643 — only checks for input focus, NOT overlays
if (isInputFocused()) return;
// After this line, ALL shortcuts fire regardless of open modals
```

**Additional bug**: Column Picker overlay uses class `column-picker-overlay` (lab.html:3548) but `isAnyOverlayOpen()` only checks for `.filter-modal-overlay.open` — the column picker is never detected as open.

## Reproduction

1. Open Lab, press C to open Column Picker
2. While Column Picker is open, press H → heat colors toggle fires
3. Press S → Saved Views modal opens ON TOP of Column Picker
4. Press ? → Shortcuts reference opens ON TOP of both

## Fix

After `if (isInputFocused()) return;` (line 10643), add:
```javascript
if (isAnyOverlayOpen()) return;
```

Also update `isAnyOverlayOpen()` to detect:
- `.column-picker-overlay` (column picker)
- `#authModal[style*="flex"]` (auth modal)
- `#shortcutRef[style*="flex"]` (shortcuts modal)
- `#savedViewsModal` (saved views)
- `#shareModal` (share/export)

## Files to Change

- `frontend/lab.js:10643` — add `isAnyOverlayOpen()` guard
- `frontend/lab.js:10564-10572` — expand overlay detection

## Accept When

1. No keyboard shortcuts fire when any modal/overlay is open (except Escape to close)
2. Column picker, filter modal, auth modal, saved views, shortcuts ref — all block shortcuts
3. Escape still closes the topmost overlay

## Do NOT Touch

- The Escape key handling — that already works correctly
- Shortcut behavior when no overlays are open
