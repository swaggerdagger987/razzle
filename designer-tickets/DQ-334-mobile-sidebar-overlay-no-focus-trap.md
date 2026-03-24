---
id: DQ-334
title: Mobile sidebar overlay has no focus trap — Tab escapes to background
priority: P2
category: accessibility
page: lab.html
cycle: 44
---

## Problem

On mobile (≤768px), clicking the hamburger menu opens the sidebar as a fullscreen overlay (translateX animation, box-shadow). But:

1. **No focus trap** — Tab keypress moves to elements behind the overlay (nav links, screener table)
2. **No `inert` attribute** on the main content when sidebar is open
3. **Main content is still interactive** — keyboard users can Tab into the table, toolbar, etc. while the sidebar visually covers them
4. **No Escape key handler** — pressing Escape doesn't close the sidebar (see DQ-335)

The mobile sidebar toggle logic (lab.html lines 5020-5041) only handles click-outside and click-on-item, not keyboard dismissal or focus management.

## Evidence

```js
// lab.html line 5023 — only toggles class, no focus management
mobileToggle.addEventListener('click', function() {
  document.getElementById('labSidebar').classList.toggle('open');
});
```

No `inert`, no `aria-modal`, no focus trap anywhere in the sidebar code.

## Expected

When sidebar overlay opens on mobile:
1. Focus moves into the sidebar
2. Tab cycles within the sidebar only (focus trap)
3. Main content gets `inert` attribute
4. Escape closes the sidebar (see DQ-335)
5. Focus returns to the hamburger button on close

## Fix

```js
// On open:
labMain.setAttribute('inert', '');
sidebar.querySelector('.sidebar-search, .lab-sidebar-item').focus();

// On close:
labMain.removeAttribute('inert');
mobileToggle.focus();
```

The `inert` attribute is a single-attribute focus trap supported in all modern browsers. No custom trap logic needed.

## Files
- `frontend/lab.html` (lines 5020-5041, mobile sidebar toggle)
