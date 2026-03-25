<!-- PM: ready -->
# DQ-413: closeAllOverlays() only covers filter-modal-overlay, misses 5 types

**Priority**: P1
**Category**: Interaction Lifecycle
**Files**: `frontend/lab.js` (line ~10479)

## Problem

`closeAllOverlays()` only targets `.filter-modal-overlay.open`:

```javascript
function closeAllOverlays() {
  document.querySelectorAll(".filter-modal-overlay.open").forEach(el => el.classList.remove("open"));
}
```

It does NOT close these overlay types:
1. **columnStatsPopover** (class: `colstats-popover`) — right-click column header
2. **tagPicker** (class: `tag-picker`) — player tag assignment
3. **noteEditor** (class: `note-editor`) — player note editing
4. **contextMenu** (class: `screener-context-menu`) — right-click player row
5. **hoverCard** (id: `playerHoverCard`) — player hover preview

The global Escape handler at line ~10501 relies on `isAnyOverlayOpen()` which ALSO only checks `.filter-modal-overlay.open`. So pressing Escape with any of these 5 overlay types open does nothing.

## What the user sees

- Right-click column header → "Column Stats" → press Escape → popover stays open
- Right-click player row → context menu → press Escape → menu stays open
- Open tag picker → press Escape → picker stays open

## Fix

Expand `closeAllOverlays()` to dismiss all 5 additional overlay types. Update `isAnyOverlayOpen()` to detect them too.

## Related

This is the broader version of the column-picker-specific issue noted in cycle 53 insights.
