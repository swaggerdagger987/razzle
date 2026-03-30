---
id: DQ-340
title: Lab mobile hamburger button missing aria-expanded state toggle
priority: P3
category: accessibility
page: lab.html
cycle: 44
---

## Problem

The Lab's mobile hamburger button has `aria-label="Toggle sidebar"` but does not update `aria-expanded` when the sidebar opens or closes.

```html
<!-- lab.html line 3135 -->
<button class="lab-menu-toggle btn-chunky" aria-label="Toggle sidebar"
        style="font-size:18px; padding:4px 10px; line-height:1;">☰</button>
```

```js
// lab.html line 5023 — toggles class but not aria-expanded
mobileToggle.addEventListener('click', function() {
  document.getElementById('labSidebar').classList.toggle('open');
});
```

Screen readers announce "Toggle sidebar, button" but never "expanded" or "collapsed". Users who rely on screen readers don't know if the sidebar is currently open or closed.

Also: the hamburger button has `aria-label` but no `aria-controls` pointing to the sidebar.

## Expected

```html
<button class="lab-menu-toggle btn-chunky"
        aria-label="Toggle sidebar"
        aria-expanded="false"
        aria-controls="labSidebar">☰</button>
```

```js
mobileToggle.addEventListener('click', function() {
  var sidebar = document.getElementById('labSidebar');
  sidebar.classList.toggle('open');
  var isOpen = sidebar.classList.contains('open');
  mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
```

## Fix

1. Add `aria-expanded="false"` and `aria-controls="labSidebar"` to the button (line 3135)
2. Update the click handler to toggle `aria-expanded` (line 5023)

2 attribute additions + 1 line of JS.

## Files
- `frontend/lab.html` (line 3135 button element, line 5023 click handler)
