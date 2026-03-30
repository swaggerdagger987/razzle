# DES-085: playerHeadshot() fallback badge uses hardcoded hex inline style

**Priority**: P2
**Area**: frontend/app.js lines 538-541
**Cycle**: 8

## Problem

The `playerHeadshot()` function in app.js creates a fallback initials badge when a player has no headshot image. It injects a hardcoded hex color as an inline style:

```javascript
var POS_COLOR_MAP = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
var bgColor = POS_COLOR_MAP[pos] || "#8a7565";
// Renders as: style="background: #5b7fff"
```

Because the color is injected as an inline `style` attribute with a hardcoded hex value, the CSS variable system cannot override it. The position colors happen to be the same in both light and dark mode per DESIGN.md, so this isn't a visible dark mode bug TODAY — but it bypasses the design system and will break if position color tokens ever diverge between modes.

This function is called from hover cards, agent peeks, and player profile panels — it appears frequently across the site.

## Fix

Use CSS classes driven by data attributes instead of inline styles:

```javascript
// Instead of style="background: #hex"
`<span class="player-initials pos-${pos.toLowerCase()}" data-pos="${pos}">...</span>`
```

With CSS:
```css
.player-initials.pos-qb { background: var(--pos-qb); }
.player-initials.pos-rb { background: var(--pos-rb); }
.player-initials.pos-wr { background: var(--pos-wr); }
.player-initials.pos-te { background: var(--pos-te); }
```

Or at minimum, use CSS var strings:
```javascript
var POS_COLOR_MAP = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
```

## Design Rule

Design system: position colors should always come from CSS vars (`--pos-qb`, `--pos-rb`, `--pos-wr`, `--pos-te`), not hardcoded hex.
