---
id: DQ-335
title: Mobile sidebar overlay has no Escape key dismiss
priority: P2
category: ux/interaction
page: lab.html
cycle: 44
---

## Problem

When the mobile sidebar overlay is open, pressing Escape does nothing. Every overlay/modal in the Lab (command palette, auth modal, context menu, column stats popover) closes on Escape — except the sidebar.

The sidebar supports click-outside-to-close (line 5028) and click-item-to-close (line 5035), but has zero keyboard dismiss handling.

## Evidence

```js
// lab.html lines 5028-5033 — click-outside handler exists
document.addEventListener('click', function(e) {
  if (sidebar.classList.contains('open') && !sidebar.contains(e.target) ...) {
    sidebar.classList.remove('open');
  }
});
```

No `keydown` listener for Escape on the sidebar or document (when sidebar is open).

## Expected

Pressing Escape while the mobile sidebar is open should close it — same behavior as every other overlay on the site.

## Fix

Add to the sidebar initialization block:

```js
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var sidebar = document.getElementById('labSidebar');
    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.querySelector('.lab-menu-toggle').focus();
    }
  }
});
```

4 lines of JS. Consistent with existing Escape handlers for context menu, command palette, and auth modal.

## Files
- `frontend/lab.html` (add near line 5033, after click-outside handler)
