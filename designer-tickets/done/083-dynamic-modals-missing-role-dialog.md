# DES-083: Dynamic modals/overlays missing role="dialog" and aria-modal

**Priority**: P2
**Area**: frontend/lab.js (4 overlay constructors)
**Cycle**: 8

## Problem

Four dynamically created overlays in lab.js lack `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`:

1. **Watchlist Overlay** (`#watchlistOverlay`, line ~10072) — no dialog role
2. **Roster Overlay** (`#rosterOverlay`, line ~11421) — no dialog role
3. **Tier Board Overlay** (`#tierBoardOverlay`, line ~10158) — no dialog role
4. **Keyboard Shortcuts Overlay** (`#shortcutRefOverlay`, line ~10636) — no dialog role

All four use `className = "filter-modal-overlay"` but none set ARIA attributes. Meanwhile, all STATIC modals in `lab.html` (filter modal, column picker, formula builder, compare, etc.) correctly use `role="dialog" aria-modal="true" aria-labelledby="..."`.

Additionally, the **Command Palette** (`#cmdPalette` in app.js, line ~1323) has no `role="dialog"` or `aria-modal` either.

Screen reader users cannot discover that a modal has opened or what it contains.

## Fix

When creating each overlay element, add:

```javascript
overlay.setAttribute('role', 'dialog');
overlay.setAttribute('aria-modal', 'true');
overlay.setAttribute('aria-label', 'Watchlist'); // or use aria-labelledby pointing to the H3
```

For the command palette:
```javascript
palette.setAttribute('role', 'dialog');
palette.setAttribute('aria-modal', 'true');
palette.setAttribute('aria-label', 'Quick Search');
```

## Design Rule

WCAG: modals must announce themselves to assistive technology. The static modals already follow this pattern — the dynamic ones should match.
