# DES-088: Screener context menu missing role="menu" + role="menuitem"

**Priority**: P1
**Area**: frontend/lab.js lines 2497-2537 and 2565-2600
**Cycle**: 9

## Problem

The Screener has two right-click context menus (column header menu and player row menu) created dynamically in `lab.js`. Both create `<div>` elements with no ARIA roles:

```javascript
// Column header context menu (line 2498)
menu.id = "screenerContextMenu";
menu.className = "screener-context-menu";
// No role="menu" set

// Items are divs with class="ctx-item"
// No role="menuitem" set
```

```javascript
// Player row context menu (line 2566)
menu.id = "screenerContextMenu";
menu.className = "screener-context-menu";
// Same: no ARIA roles
```

Screen readers don't identify these as menus. Users can't navigate items with arrow keys. The context menu is core Lab functionality — Hide Column, Sort, Column Stats, View Profile, Add to Compare, Watchlist.

## Fix

1. Add `role="menu"` to the menu container:
```javascript
menu.setAttribute("role", "menu");
```

2. Add `role="menuitem"` and `tabindex="-1"` to each `.ctx-item`:
```javascript
'<div class="ctx-item" role="menuitem" tabindex="-1" data-action="...">'
```

3. Add `role="separator"` to `.ctx-sep` dividers:
```javascript
'<div class="ctx-sep" role="separator"></div>'
```

4. On menu open, focus the first item. Add arrow key navigation (Up/Down between items, Escape to close).

## Design Rule

WCAG 2.1 SC 4.1.2: Name, Role, Value. WAI-ARIA menu pattern requires role="menu" on container and role="menuitem" on items with keyboard arrow navigation.
