# DQ-113: Watermark inline style duplicated across 23+ standalone pages

**Priority**: P3 (maintainability)
**Category**: CSS Architecture / DRY
**Severity**: Low visual impact, high maintenance cost

## Problem

Every standalone panel page has an identical watermark div with the exact same 7-property inline style:

```html
<div style="position:fixed; bottom:10px; right:14px; font-family:var(--font-hand);
font-size:14px; color:var(--ink-light); opacity:0.7; pointer-events:none;
z-index:999;">razzle.lol</div>
```

This identical string appears in **23+ files**: aging.html, airyards.html, awards.html, breakouts.html, buysell.html, consistency.html, efficiency.html, explorer.html, opportunity.html, and more.

Any design change to the watermark (size, position, color, text) requires editing 23+ files manually.

## Evidence

```
grep -c "position:fixed.*razzle.lol" frontend/*.html → 23 files
```

## Fix

1. Add `.watermark` class to `styles.css`:
```css
.watermark {
  position: fixed;
  bottom: 10px;
  right: 14px;
  font-family: var(--font-hand);
  font-size: 14px;
  color: var(--ink-light);
  opacity: 0.7;
  pointer-events: none;
  z-index: 999;
}
```

2. Replace all 23+ inline watermark divs with:
```html
<div class="watermark">razzle.lol</div>
```

## Not a duplicate of

- done/004 (watermark style inconsistency) — that ticket made the watermarks CONSISTENT. This ticket extracts the now-consistent style into a CSS class.
- DQ-083 (pricing page missing watermark) — about missing watermark, not about the delivery mechanism.
