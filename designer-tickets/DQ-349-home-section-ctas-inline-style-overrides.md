---
id: DQ-349
title: Home page section CTAs override btn-hero sizing with inline styles
priority: P3
category: CSS hygiene
page: index.html
cycle: 45
---

## Problem

Three section-level CTA buttons on the home page override the btn-hero base styling with inline `style` attributes:

```html
<!-- Line 683 -->
<a href="/lab.html" class="btn-hero btn-hero-primary" style="font-size:14px; padding:10px 24px;">

<!-- Line 755 -->
<a href="/league-intel.html" class="btn-hero btn-hero-primary" style="font-size:14px; padding:10px 28px;">

<!-- Line 778 -->
<a href="/agents.html" class="btn-hero btn-hero-secondary" style="font-size:14px; padding:10px 28px;">
```

All three override font-size (16px→14px) and padding (14px 32px→10px 24-28px) inline. This pattern:
1. Cannot be overridden by media queries (inline > class specificity)
2. Creates inconsistent padding (24px vs 28px)
3. Duplicates the same override 3 times

The mobile media query at line 589 (`font-size:14px; padding:10px 22px;`) can't affect these because inline styles win.

## Fix

Create a modifier class:
```css
.btn-hero-sm {
    font-size: 14px;
    padding: 10px 28px;
}
```

Then remove inline styles:
```html
<a href="/lab.html" class="btn-hero btn-hero-secondary btn-hero-sm">Open the full Screener</a>
```

## Files
- `frontend/index.html` (lines 683, 755, 778)
