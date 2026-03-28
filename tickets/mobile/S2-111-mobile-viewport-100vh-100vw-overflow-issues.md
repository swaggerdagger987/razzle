---
id: S2-111
severity: S2
confidence: HIGH
category: mobile
source: DQ-141+151+174+193+248+488
status: OPEN
---

# Mobile viewport issues — 100vh, 100vw, minmax, watermark overlap

## Problems

1. **`100vh` without `dvh` fallback** (DQ-141) — `frontend/styles.css` uses `height: 100vh` in 3 instances. On mobile Safari, `100vh` includes the URL bar height, causing content to be cut off. Fix: `height: 100dvh` with `100vh` fallback.

2. **`width: 100vw` causes horizontal scrollbar** (DQ-151) — `100vw` includes scrollbar width on desktop, causing a horizontal overflow. Affects at least 1 element in styles.css.

3. **Fixed watermark overlaps content on mobile** (DQ-174) — 22 standalone pages have a fixed-position watermark that overlaps table data on narrow viewports. Needs `display: none` at 480px or repositioning.

4. **Heatmap canvas forces 700px minimum width** (DQ-193) — Canvas element has hardcoded `width: 700` or `min-width: 700px`, causing horizontal overflow on mobile. Needs responsive canvas sizing.

5. **`.plan-badge` absolute positioning clips at narrow viewports** (DQ-248) — Pricing page plan badges clip out of view at 375px.

6. **Lab panel card grids use `minmax(340px, 1fr)`** (DQ-488) — At 375px viewport (35px less than 340 + padding), cards overflow. Should use `minmax(280px, 1fr)` or a media query override.

## Files

- `frontend/styles.css` — `100vh`, `100vw` instances
- 22 standalone HTML files — fixed watermark
- `frontend/matchups.html` (or similar) — heatmap canvas width
- `frontend/pricing.html` — plan-badge positioning
- `frontend/lab-panels.css` — card grid minmax

## Acceptance Criteria

1. No horizontal scrollbar at 375px viewport width on any page
2. Full-height elements work correctly on mobile Safari (no URL bar cutoff)
3. Watermark doesn't overlap content on mobile
4. Heatmap canvas is scrollable or responsive on narrow screens
5. Card grids don't overflow at 375px
