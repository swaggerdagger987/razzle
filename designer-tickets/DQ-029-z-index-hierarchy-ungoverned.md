# DQ-029: Z-index hierarchy undocumented and ungoverned

**Priority**: P2 — Maintenance hazard, potential overlap bugs
**Category**: Layout / Architecture
**Severity**: MEDIUM — No z-index tokens, arbitrary values (9999, 10000, 1000)

## Problem

The codebase uses ad-hoc z-index values with no documented hierarchy:

| Z-Index | Element | File:Line |
|---------|---------|-----------|
| 10000 | `.skip-link` | styles.css:390 |
| 9999 | `.mobile-nav` | styles.css:290 |
| 9999 | `.auth-modal-overlay` | styles.css:647 |
| 9998 | `.mobile-nav-overlay` | styles.css:273 |
| 9000 | `.global-search-wrapper` | styles.css:1074 |
| 1000 | `.tooltip` / `.popover` / `.modal` | styles.css:576,1409,1502 |

Problems:
- `.mobile-nav` and `.auth-modal-overlay` both use 9999 — which wins if both open?
- 10000→9999→9000→1000 gap is arbitrary
- CSS best practice: z-index should be governed by tokens

## Fix

Add z-index CSS custom properties at the top of styles.css:

```css
:root {
  --z-base: 1;
  --z-sticky: 10;
  --z-dropdown: 100;
  --z-tooltip: 200;
  --z-modal: 300;
  --z-search: 400;
  --z-nav-overlay: 500;
  --z-nav: 600;
  --z-skip: 700;
}
```

Then replace all hardcoded values. This is a bigger refactor — Ship agent can do it incrementally.
