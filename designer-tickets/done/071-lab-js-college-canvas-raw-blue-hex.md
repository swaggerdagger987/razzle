# DES-071: lab.js college canvas sections use raw #5b7fff (6 lines)

**Priority**: P2
**Area**: frontend/lab.js (college profile canvas rendering)
**Cycle**: 7
**Depends on**: DES-069

## Problem

Six lines in the college profile canvas drawing functions use `#5b7fff` (blue) directly instead of reading from the canvas theme:

```javascript
// Line 7436 — canvas title text
ctx.fillStyle = "#5b7fff";

// Line 7482 — area fill
ctx.strokeStyle = "#5b7fff";

// Line 7494 — data point fill
ctx.fillStyle = "#5b7fff";

// Line 7589 — radar grid
ctx.strokeStyle = "#5b7fff";

// Line 7603 — radar data fill
ctx.fillStyle = "#5b7fff";

// Line 7684 — bar chart fill
ctx.fillStyle = "#5b7fff";
```

These are all in canvas contexts (not DOM) and render with the `getCanvasTheme()` pattern for other properties (bg, ink, etc.) but hardcode blue.

**Dark mode impact**: On dark espresso background, `#5b7fff` blue is fine but won't adapt if the palette ever shifts. More importantly, it's inconsistent — everything else reads from theme.

## Fix

After DES-069 adds `t.blue` to the canvas theme:
```javascript
ctx.fillStyle = t.blue;
```

## Design Rule

DESIGN.md: Blue `#5b7fff` is the NCAA/college/QB color token `--blue`. Canvas code should use the theme's blue property.
