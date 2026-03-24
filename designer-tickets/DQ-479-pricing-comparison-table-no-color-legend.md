---
id: DQ-479
title: pricing.html comparison table uses color coding with no legend
priority: P3
category: ux-clarity
status: open
cycle: 60
---

## Problem

The pricing feature comparison table uses three colors to indicate feature availability:
- Green (var(--green)) = included
- Orange (var(--orange)) = limited / capped
- Light gray (var(--ink-light)) = not included

There is no legend explaining what these colors mean. A first-time visitor scanning the table must infer the color semantics from context. Users with color vision deficiency may not distinguish the green/orange cells at all.

## Evidence

`frontend/pricing.html` lines 140-142:
```css
.feature-matrix .yes { color: var(--green); font-weight: 700; }
.feature-matrix .no { color: var(--ink-light); }
.feature-matrix .limit { color: var(--orange); font-weight: 600; }
```

The table cells contain checkmarks, dashes, and limit text ("20/day", "5 max") but no explicit legend row or key.

## Fix

Add a small legend above or below the table:

```html
<div style="display:flex; gap:16px; justify-content:center; margin-bottom:12px; font-family:var(--font-mono); font-size:11px;">
  <span><span style="color:var(--green); font-weight:700;">&#10003;</span> Included</span>
  <span><span style="color:var(--orange); font-weight:600;">&#9679;</span> Limited</span>
  <span><span style="color:var(--ink-light);">&#8212;</span> Not included</span>
</div>
```

## Files
- `frontend/pricing.html` — add legend near the `.matrix-section`
