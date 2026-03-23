# DES-189: Home mini-screener sortable headers not keyboard accessible

**Priority**: P2
**Category**: Accessibility / Growth Engine
**Affects**: index.html lines 671-673 — the front-door demo screener
**Cycle**: 18

## Problem

The home page mini-screener has 3 sortable column headers (`PPG`, `GP`, `Age`) that use `<th onclick="_miniSort()">`. These are interactive but:
- No `tabindex="0"` — keyboard users can't reach them
- No `role="button"` — screen readers announce them as plain headers, not clickable
- No `aria-sort` attribute — no announcement of current sort state
- No `:focus-visible` styling — even if focused, no visual indicator
- No `Enter`/`Space` keydown handler — keyboard activation impossible

## Evidence

`index.html:671-673`:
```html
<th class="mini-sortable" data-sort="ppg" onclick="_miniSort('ppg')">PPG</th>
<th class="mini-sortable" data-sort="games" onclick="_miniSort('games')">GP</th>
<th class="mini-sortable" data-sort="age" onclick="_miniSort('age')">Age</th>
```

Compare with lab.html's main screener headers which DO have keyboard support via event delegation in lab.js.

## Fix

Add to each sortable header:
```html
<th class="mini-sortable" data-sort="ppg" onclick="_miniSort('ppg')"
    tabindex="0" role="button" aria-sort="none"
    onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();_miniSort('ppg')}">PPG</th>
```

Add CSS:
```css
.mini-sortable:focus-visible { outline: 2px solid var(--orange); outline-offset: -2px; }
```

Update `_miniSort()` to set `aria-sort="ascending"` / `aria-sort="descending"` on the active header.

## Why it matters

The mini-screener is the FIRST interaction visitors have with Razzle data. DES-109 covers the row click accessibility; this covers the sort interaction. Keyboard users trying to sort the demo table get nothing.
