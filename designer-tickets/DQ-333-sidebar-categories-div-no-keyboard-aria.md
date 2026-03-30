---
id: DQ-333
title: Lab sidebar collapsible categories — <div> with click, no keyboard/ARIA
priority: P2
category: accessibility
page: lab.html
cycle: 44
---

## Problem

Sidebar categories (e.g., "Rankings & Values", "Performance", "Game Analysis") are collapsible `<div>` elements with JavaScript click handlers. They have:

- No `tabindex` → not keyboard-focusable
- No `role="button"` → screen readers don't announce them as interactive
- No `aria-expanded` → state change (collapsed/expanded) not communicated
- No keyboard handler → Enter/Space don't toggle

The toggle logic is in lab.html lines 4836-4877: `cat.addEventListener('click', function() { ... })` with CSS class `cat-collapsed`. But the `<div>` elements themselves have no accessibility attributes.

## Evidence

```html
<!-- lab.html line 3211 — typical category element -->
<div class="lab-sidebar-category">
  <span class="cat-icon">...</span>
  <span class="cat-text">Rankings &amp; Values</span>
  <span class="cat-chevron">▸</span>
</div>
```

No `tabindex`, no `role`, no `aria-expanded` on any of the ~10 category headers.

## Expected

Categories should be keyboard-accessible and announce their state:

```html
<div class="lab-sidebar-category" tabindex="0" role="button" aria-expanded="true">
```

## Fix

1. Add `tabindex="0"` and `role="button"` to each category `<div>` (lines 3193-3267)
2. In the toggle handler (line 4867), update `aria-expanded`:
   ```js
   cat.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
   ```
3. Add keydown handler for Enter and Space:
   ```js
   cat.addEventListener('keydown', function(e) {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       cat.click();
     }
   });
   ```

~10 categories × 3 attributes + 5 lines JS = small fix.

## Files
- `frontend/lab.html` (category `<div>` elements + toggle JS at line 4867)
