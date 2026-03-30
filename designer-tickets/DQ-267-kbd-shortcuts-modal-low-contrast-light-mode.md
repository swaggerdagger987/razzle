---
id: DQ-267
title: Keyboard shortcut kbd elements use light-on-light styling — barely visible in light mode
priority: P3
category: ux
status: open
cycle: 36
---

## Problem

The Lab's keyboard shortcuts modal (press ? to open) renders `<kbd>` elements with `background:var(--bg)` — sand-colored background on a sand-colored page. The key labels blend into the surrounding UI and are hard to parse at a glance.

Standard `<kbd>` styling uses high-contrast treatment (dark bg, light text) to make keys visually pop as interactive affordances. Razzle's version looks washed out.

## Evidence

`frontend/lab.js` line ~10774 (shortcutRow function):
```html
<kbd style="font-family:var(--font-mono); font-size:13px; background:var(--bg);
border:2px solid var(--ink); border-radius:var(--radius-sm); padding:2px 8px;
box-shadow:2px 2px 0 var(--ink);">KEY</kbd>
```

Also line ~13127: quick search hint uses even fainter `border:2px solid var(--ink-faint)`.

## Fix

Change kbd background to `var(--bg-warm)` (slightly darker sand) or `var(--ink)` with `color: var(--bg-card)` for a proper keyboard key look:

```css
kbd {
  background: var(--bg-warm);
  border: 2px solid var(--ink);
  color: var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
}
```

Or for maximum readability (inverted):
```css
kbd {
  background: var(--ink);
  color: var(--bg-card);
  border: 2px solid var(--ink);
}
```

## Files
- `frontend/lab.js` — shortcutRow function inline styles (~line 10774)
- `frontend/lab.js` — quick search hint (~line 13127)
- Consider moving to `styles.css` as a proper `kbd` rule

## Impact
The shortcuts modal is a power-user feature. Power users are the most likely to screenshot and share. Make their discovery moment crisp.
