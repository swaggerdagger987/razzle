---
id: DQ-174
priority: P2
category: mobile/responsive
status: open
cycle: 26
---

# Fixed watermark overlaps content on mobile — 22 pages

## What's wrong

22 standalone pages have an identical `position:fixed` watermark at `bottom:10px; right:14px` with no mobile media query adjustment. On 480px screens, this watermark:
- May overlap the last row of data or a button
- Sits at 14px from the right edge which is too close on narrow screens
- Uses 14px font size which is proportionally large on mobile

## Where (all 22 pages)

aging.html, airyards.html, awards.html, breakouts.html, buysell.html, consistency.html, efficiency.html, explorer.html, handcuffs.html, opportunity.html, redzone.html, reportcard.html, scarcity.html, schedule.html, stocks.html, targets.html, tradefinder.html, tradevalues.html, usage.html, vorp.html, weekly.html, yoy.html

## Code (identical in all 22)

```html
<div style="position:fixed; bottom:10px; right:14px; font-family:var(--font-hand); font-size:14px; color:var(--ink-light); opacity:0.7; pointer-events:none; z-index:999;">razzle.lol</div>
```

## Fix

Add a shared CSS class `.watermark` in styles.css instead of inline styles, with a 480px media query:

```css
.watermark {
  position: fixed; bottom: 10px; right: 14px;
  font-family: var(--font-hand); font-size: 14px;
  color: var(--ink-light); opacity: 0.7;
  pointer-events: none; z-index: 999;
}
@media (max-width: 480px) {
  .watermark { bottom: 4px; right: 6px; font-size: 12px; opacity: 0.5; }
}
```

Replace inline styles in all 22 pages with `class="watermark"`.

## Test

1. Open any of the 22 pages at 375px viewport. Watermark should be small and tucked into the corner without overlapping content.
