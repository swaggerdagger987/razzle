# DES-297: Lab toolbar position chips are `<span onclick>` without role or tabindex

**Priority**: P2
**Category**: Accessibility
**Page**: lab.html
**Lines**: 3319-3323

## Problem

The 5 position filter chips (All/QB/RB/WR/TE) in the Lab toolbar are `<span>` elements with `onclick` handlers. They have no `role="button"`, no `tabindex="0"`, and no keyboard event listener. Screen readers don't announce them as interactive. Keyboard users can't reach or activate them.

These are the MAIN position filter controls — the first thing a user interacts with in the Screener.

**Note**: DES-084 covered filter chip REMOVE buttons, star/watchlist/pin tds. These are DIFFERENT elements — the toolbar position chips at the top of the Lab.

## Current

```html
<span class="chip active" data-pos="ALL" onclick="togglePosition('ALL')">All</span>
<span class="chip" data-pos="QB" onclick="togglePosition('QB')">QB</span>
```

## Expected

```html
<button class="chip active" data-pos="ALL" onclick="togglePosition('ALL')">All</button>
<button class="chip" data-pos="QB" onclick="togglePosition('QB')">QB</button>
```

Or if `<button>` breaks styling, add `role="button" tabindex="0"` and Enter/Space keydown handler.

## Fix

Replace all 5 `<span class="chip">` with `<button class="chip">` at lines 3319-3323. Buttons are natively focusable and keyboard-accessible. Adjust CSS if needed (buttons may need `border:none; background:none;` reset).
