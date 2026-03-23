# DES-108: Lab sidebar category headers not accessible

**Priority**: P1 — affects Lab sidebar navigation (the product's primary nav)
**Category**: Keyboard accessibility, ARIA
**WCAG**: 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)

## Problem

Lab sidebar category headers (`<div class="lab-sidebar-category">`) are clickable divs that expand/collapse groups of panel links. They have:
- No `role="button"`
- No `tabindex`
- No `aria-expanded`
- No `onkeydown` handler

Keyboard users cannot expand/collapse panel groups. Screen readers don't announce them as interactive or tell users whether groups are open or closed.

## Location

`frontend/lab.html` lines 3200-3271 — all 8 category headers:
- Rankings & Values, Performance, Game Analysis, Trends & Projections, College, Player Tools, League Tools, Records & History

## Evidence

```html
<div class="lab-sidebar-category">
  <span class="cat-icon" style="display:none">📊</span>
  <span class="cat-text">Rankings &amp; Values</span>
  <span class="cat-chevron">▸</span>
</div>
```

No ARIA attributes, no keyboard support, no role. Just a plain div.

## Fix

1. Add `role="button"` and `tabindex="0"` to each `.lab-sidebar-category`
2. Add `aria-expanded="true"` (toggled on click)
3. Add `onkeydown` handler for Enter/Space to toggle expand/collapse
4. Update the JS that handles collapse (around line 4175) to also toggle `aria-expanded`

## Why This Matters

If keyboard users can't collapse/expand sidebar groups, they have to tab through all 60+ panel links to find what they need. The categories are the organizational structure — without them being keyboard accessible, the sidebar is an unsorted list of 60+ items.
