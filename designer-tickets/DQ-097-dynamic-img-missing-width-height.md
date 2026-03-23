---
id: DQ-097
title: Dynamic headshot <img> tags missing width/height — cumulative layout shift risk
priority: P2
category: performance
status: open
cycle: 13
---

## Problem

All player headshot images across 11+ standalone pages are generated via JavaScript without explicit `width` and `height` HTML attributes:

```js
html += '<img class="air-headshot" src="..." alt="" loading="lazy" onerror="...">';
```

CSS class sizing (e.g., `.air-headshot { width: 32px; height: 32px; }`) mitigates layout shift in most cases, but HTML attributes are the browser's first signal for reserving space before CSS loads. Without them, headshots cause visible layout shift (CLS) on slower connections or when images load after text.

## Evidence

Code: Grep for `<img.*headshot` across all JS-generating HTML in standalone pages:
- `airyards.html:489` — `air-headshot` (no w/h)
- `awards.html:522` — `aw-winner-headshot` (no w/h)
- `breakouts.html:576` — `breakout-headshot` (no w/h)
- `buysell.html` — headshot images (no w/h)
- `dashboard.html` — top-5 card headshots (no w/h)
- `rankings.html` — player card headshots (no w/h)
- `stocks.html`, `reportcard.html`, `leaders.html`, `tiers.html`, `consistency.html` — all similar

## Fix

Add explicit `width` and `height` attributes matching the CSS class dimensions:

```js
// Before
html += '<img class="air-headshot" src="..." alt="">';
// After
html += '<img class="air-headshot" src="..." alt="" width="32" height="32">';
```

Mechanical find-replace in each file. Check CSS class for actual dimensions first.

## Files
- 11+ standalone HTML files (see list above)
