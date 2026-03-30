---
id: DQ-389
title: Inline JS hover handlers (onmouseenter/onmouseleave) bypass @media(hover:hover) guard
priority: P2
category: mobile / interaction
page: lab.js, lab.html, formula-store.js, player.js
status: open
cycle: 50
---

## Problem

8 instances of inline `onmouseenter`/`onmouseleave`/`onmouseover`/`onmouseout` event handlers in template-generated HTML provide hover lift effects. These bypass the `@media (hover: hover)` guard that DQ-144 addresses for CSS-only hover rules.

On touch devices, these JS handlers fire on tap, causing elements to get "stuck" in hover state (translated + shadow) until another element is tapped.

## Evidence

- `lab.js:4563` — player search autocomplete card: `onmouseenter="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='4px 4px 0 var(--ink)'"` + matching onmouseleave
- `lab.js:12200` — comp finder card: `onmouseover` + `onmouseout` for translate + shadow
- `formula-store.js` — 2 instances on formula cards
- `player.js` — 1 instance on related player cards
- `lab.html` — 1 instance in toolbar area

Total: 8 inline JS hover handlers across 4 files.

## Fix

Replace inline JS hover effects with CSS classes that respect the media query:

```css
@media (hover: hover) {
  .card-liftable:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--ink);
  }
}
```

Then in the template HTML, replace `onmouseenter`/`onmouseleave` with the class:

```html
<!-- Before -->
<div onmouseenter="..." onmouseleave="...">

<!-- After -->
<div class="card-liftable">
```

## Verification

1. Open Lab on a touch device (or Chrome DevTools mobile emulation)
2. Tap a comp finder result card or player autocomplete result
3. Card should NOT get stuck in hover state after tap
