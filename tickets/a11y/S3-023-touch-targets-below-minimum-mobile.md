# S3-023: Touch targets below 24px minimum on mobile

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #22
**WCAG**: 2.5.8 (Target Size Minimum, Level AA — WCAG 2.2)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

At 375px viewport width, interactive elements shrink below the 24x24px WCAG 2.2 AA minimum:

`frontend/styles.css` mobile breakpoints:
```css
/* 768px */
.btn-chunky, .btn-primary { font-size: 11px; padding: 5px 10px; }
.chip { font-size: 10px; padding: 2px 7px; }

/* 375px (implied by lab.html and similar) */
.btn-chunky, .btn-primary { font-size: 10px; padding: 4px 7px; }
.chip { font-size: 9px; padding: 4px 8px; }
```

Chips at 375px are approximately 20x15px — well below both the 44x44px ideal and the 24x24px minimum.

Note: Mobile nav links already have `min-height: 44px` (good). This issue is specific to chips, small buttons, and filter controls.

## Fix

Add `min-height: 24px; min-width: 24px;` to interactive chip and small button elements in mobile breakpoints:
```css
@media (max-width: 480px) {
  .chip { min-height: 24px; min-width: 24px; padding: 4px 8px; }
  .btn-chunky, .btn-primary { min-height: 24px; }
}
```

## Files to Change

- `frontend/styles.css` — mobile breakpoint rules for `.chip`, `.btn-chunky`, `.btn-primary`

## Accept When

1. All interactive elements at 375px viewport are at least 24x24px
2. Chips are tappable without mis-taps on mobile
