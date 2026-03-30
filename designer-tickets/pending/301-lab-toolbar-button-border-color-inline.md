# DES-301: Lab toolbar buttons use inline border-color overrides

**Priority**: P2
**Category**: Design System
**Page**: lab.html
**Lines**: 3364-3379

## Problem

Tools dropdown buttons have inconsistent border-color applied via inline styles. Some buttons have accent-colored borders, others use default. This creates visual inconsistency and makes dark mode / theme changes impossible without touching HTML.

```
Watchlist:  style="border-color:var(--orange);"
My Roster:  style="border-color:var(--green);"
Charts:     (no inline style — uses default)
Compare:    (no inline style)
Share:      style="border-color:var(--orange);"
Clear:      style="border-color:var(--ink-light);"
```

## Impact

- Can't override in dark mode CSS
- No semantic meaning — why is Watchlist orange but Charts isn't?
- Inconsistent visual weight in the dropdown

## Expected

Create CSS utility classes:
```css
.btn-accent { border-color: var(--orange); }
.btn-success { border-color: var(--green); }
.btn-muted { border-color: var(--ink-light); }
```

## Fix

1. Add 3 CSS utility classes to styles.css
2. Replace 4 inline `style="border-color:..."` with the appropriate class
3. Remove inline style attributes from these buttons
