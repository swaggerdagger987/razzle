---
id: DQ-191
priority: P1
category: mobile
status: open
---

# DQ-191: Formula/Publish modals overflow on mobile — inline width overrides max-width

## Problem

Two modals in `lab.html` have inline `width` that overrides the CSS `max-width: 90vw` rule on `.filter-modal`. On a 375px iPhone SE, both modals overflow the viewport:

- **Line 3556**: Formula Builder modal — `style="width:440px;"` (440px > 375px viewport)
- **Line 3940**: Publish to Store modal — `style="width:420px;"` (420px > 375px viewport)

Inline `width` takes precedence over CSS `max-width`, so the 90vw safety net is bypassed.

## Fix

Replace fixed `width` with `max-width` in both inline styles:

```html
<!-- Line 3556 -->
<div class="filter-modal" style="max-width:440px; width:90vw;" ...>

<!-- Line 3940 -->
<div class="filter-modal" style="max-width:420px; width:90vw;" ...>
```

Or remove the inline width entirely and let the `.filter-modal` CSS handle it.

## Scope

2 inline style edits in `frontend/lab.html`.
