# DES-074: lab.js data bar uses linear-gradient — design guide violation

**Priority**: P2
**Area**: frontend/lab.js line 1834 (Screener data table cell bars)
**Cycle**: 7

## Problem

The Screener's "data bars" feature (toggled with B key) uses a CSS gradient to create a horizontal bar effect inside table cells:

```javascript
// Line 1833-1834
const barColor = INVERSE_STATS.has(key) ? "rgba(230,57,70,0.13)" : "rgba(217,119,87,0.18)";
cellStyle = `background:linear-gradient(90deg, ${barColor} ${bw}%, transparent ${bw}%);`;
```

This creates a hard-stop gradient (not a smooth blend) to simulate a bar filling from left to right. The design guide says "Don't: Gradients."

While this is a FUNCTIONAL gradient (hard stops, not decorative), it's still technically a gradient in the CSS. The same effect is achieved elsewhere using nested divs with percentage width (see `.tv-bar-fill` in lab-panels.css).

## Fix

Replace the gradient approach with a `::before` pseudo-element or inner span approach:

Option A — CSS class:
```css
.data-bar-cell { position: relative; }
.data-bar-cell::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--orange); opacity: 0.18;
  width: var(--bar-width);
}
```

Option B — simpler inline approach:
```javascript
cellStyle = `background-size:${bw}% 100%; background-image:none; background-color:${barColor};`
// Use background-size to clip a solid background
```

The key is: no `linear-gradient` in the CSS.

## Design Rule

DESIGN.md: "Don't: Gradients." No exceptions specified.
