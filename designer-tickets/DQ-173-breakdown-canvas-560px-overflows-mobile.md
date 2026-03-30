---
id: DQ-173
priority: P1
category: mobile/responsive
status: open
cycle: 26
---

# breakdown.html canvas 560x560 overflows on mobile

## What's wrong

The Points Breakdown page creates a 560x560px donut chart canvas with no max-width constraint or responsive wrapper. On any screen narrower than 560px (all phones, small tablets), this canvas overflows the viewport and forces horizontal scrolling.

Additionally, breakdown.html has ZERO `@media (max-width: 480px)` rules — it only has a 768px breakpoint. Everything that stacks at 768px doesn't resize further for phones.

## Where

- `frontend/breakdown.html:634` — canvas creation
- `frontend/breakdown.html` — entire file missing 480px breakpoint

## Code

```javascript
// breakdown.html:634
html += '<div class="bd-canvas-wrap"><canvas id="bdDonut" width="560" height="560" ...></canvas>';
```

## Fix

1. Add `max-width: 100%` to `.bd-canvas-wrap` and the canvas element
2. In JavaScript, read the container width and set canvas dimensions dynamically: `Math.min(560, container.clientWidth - 32)`
3. Add a `@media (max-width: 480px)` block that reduces gap, font sizes, and padding for phone screens

## Test

1. Open /breakdown.html on a 375px viewport. No horizontal scroll. Donut chart fits within viewport.
