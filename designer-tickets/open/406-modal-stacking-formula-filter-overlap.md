# DQ-406: Modal Stacking Not Prevented (Formula + Filter Can Overlap)

**Priority**: P2 (UX friction)
**Category**: Modal UX
**Page**: lab.html (Screener)

## Problem

Both `#formulaOverlay` and `#filterModalOverlay` are `.filter-modal-overlay` elements. If a user opens the filter modal, then somehow triggers the formula builder without closing filters first, both overlays stack visually. The global Escape handler at line ~10479 calls `closeAllOverlays()` which removes ALL `.filter-modal-overlay.open` at once.

Users can't close just the topmost modal — Escape nukes everything.

## Fix

Add a modal nesting guard: when opening any overlay, close any other open overlay first. In the functions that open each overlay, add:

```javascript
// Before opening formula overlay:
document.querySelectorAll('.filter-modal-overlay.open').forEach(el => el.classList.remove('open'));
```

This ensures only one overlay is open at a time.

## Evidence

- Line ~3555: `#formulaOverlay` uses `.filter-modal-overlay` class
- Line ~3520: `#filterModalOverlay` uses same class
- Line ~10479: `closeAllOverlays()` removes ALL `.open` — no topmost-first logic
