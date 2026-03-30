# DQ-083: Pricing page has no watermark

**Priority**: P3 — brand consistency
**Category**: Brand / Completeness
**Files**: `frontend/pricing.html`

## Problem

The pricing page (`pricing.html`) has no `<div class="watermark">razzle.lol</div>` element. Every other standalone page has one:
- dashboard.html line 364 — has watermark
- tiers.html line 308 — has watermark
- rankings.html — has watermark
- archetypes.html line 297 — has watermark
- auction.html line 360 — has watermark
- 22+ other standalone pages — have watermark

Pricing is the primary conversion page. If a user screenshots the pricing comparison to share in a group chat ("should we split this?"), there's no brand watermark on the export.

## Fix

Add the watermark div before `</body>`:

```html
<div class="watermark">razzle.lol</div>
```

The `.watermark` class in styles.css handles all styling.

## Verification

Open pricing.html. Confirm "razzle.lol" appears fixed at bottom-right, matching other pages.
