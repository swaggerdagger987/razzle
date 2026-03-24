---
id: DQ-331
title: Lab sidebar 73 panel links are <a> without href — entirely keyboard-inaccessible
priority: P1
category: accessibility
page: lab.html
cycle: 44
---

## Problem

The Lab sidebar navigation contains 73 `<a class="lab-sidebar-item">` elements, all using `onclick="switchPanel('...')"` but NONE have an `href` attribute or `tabindex`. Without `href`, `<a>` elements are excluded from the browser's tab order and cannot be reached by keyboard navigation.

**This means: keyboard-only users cannot navigate between ANY panels in the Lab.** The sidebar is the primary navigation for the entire product — 67+ panels — and it's completely unreachable without a mouse.

## Evidence

```html
<!-- lab.html lines 3194-3270: all 73 sidebar items follow this pattern -->
<a class="lab-sidebar-item" data-panel="rankings" data-icon="♠" onclick="switchPanel('rankings')">Dynasty Rankings<span class="sidebar-tooltip">Dynasty Rankings</span></a>
```

- 0 `href` attributes on sidebar items
- 0 `tabindex` attributes on sidebar items
- 0 `role="button"` attributes on sidebar items
- grep confirms: `<a class="lab-sidebar-item` appears 73 times, zero match `tabindex` or `href`

## Expected

Every sidebar panel link should be keyboard-focusable and activatable via Enter/Space.

## Fix

**Option A (minimal):** Add `href="#"` and `e.preventDefault()` in the onclick:
```html
<a class="lab-sidebar-item" href="#" data-panel="rankings" onclick="switchPanel('rankings'); return false;">
```

**Option B (better):** Convert from `<a>` to `<button>` elements since they're not navigation links — they switch panel content in-place:
```html
<button class="lab-sidebar-item" data-panel="rankings">Dynasty Rankings</button>
```
Then handle clicks via event delegation (see DQ-338).

**Option C (quickest):** Add `tabindex="0"` and `role="button"` to each `<a>`:
```html
<a class="lab-sidebar-item" tabindex="0" role="button" ...>
```

73 elements × 1 attribute = 73 additions. 5 minutes with find-and-replace.

## Files
- `frontend/lab.html` (lines 3179-3270, all `lab-sidebar-item` elements)
