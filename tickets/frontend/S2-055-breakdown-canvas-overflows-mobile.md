# S2-055: breakdown.html canvas 560px overflows on mobile

**Severity**: S2 (Medium)
**Category**: frontend
**Source**: designer-tickets/DQ-173
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/breakdown.html:633` — The donut chart canvas has a hardcoded width of 560px. CSS wraps it at 280px for desktop and 240px for 768px breakpoint, but there's no 480px breakpoint. On small phones (375px), the canvas element can overflow its container.

```html
<!-- breakdown.html:633 -->
<canvas id="bdDonut" width="560" height="560" ...></canvas>
```

CSS constraints:
- Default: `.bd-canvas-wrap { width: 280px }` (adequate)
- 768px: scales to 240px
- 480px: **MISSING** — no breakpoint handling

## Fix

Add a 480px media query:
```css
@media (max-width: 480px) {
  .bd-canvas-wrap { width: 100%; max-width: 240px; }
  #bdDonut { width: 100%; height: auto; }
}
```

Or use responsive canvas sizing via CSS `width: 100%; height: auto;` with a `max-width`.

## Files to Change

- `frontend/breakdown.html` — add 480px media query

## Accept When

1. Donut chart doesn't overflow on 375px screens
2. Chart remains readable at small sizes
