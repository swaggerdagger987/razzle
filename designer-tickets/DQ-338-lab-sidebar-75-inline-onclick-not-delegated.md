---
id: DQ-338
title: Lab sidebar 75 inline onclick handlers — should use event delegation
priority: P3
category: code-quality/performance
page: lab.html
cycle: 44
---

## Problem

Every sidebar panel link has an inline `onclick` attribute:

```html
<a class="lab-sidebar-item" data-panel="rankings" onclick="switchPanel('rankings')">
<a class="lab-sidebar-item" data-panel="tiers" onclick="switchPanel('tiers')">
<!-- ... 73 more like this -->
```

Additionally, lab.html lines 5035-5041 attach ANOTHER click listener to every sidebar item for mobile close behavior:

```js
document.querySelectorAll('.lab-sidebar-item').forEach(function(item) {
  item.addEventListener('click', function() {
    if (window.innerWidth <= 768) {
      document.getElementById('labSidebar').classList.remove('open');
    }
  });
});
```

This means: 75 inline onclick + 73 addEventListener = **148 individual event handlers** on sidebar items.

## Expected

One delegated event listener on the sidebar container, using the existing `data-panel` attributes:

```js
document.getElementById('labSidebar').addEventListener('click', function(e) {
  var item = e.target.closest('.lab-sidebar-item');
  if (!item) return;
  var panel = item.dataset.panel;
  if (panel) switchPanel(panel);
  if (window.innerWidth <= 768) {
    document.getElementById('labSidebar').classList.remove('open');
  }
});
```

## Fix

1. Remove all `onclick="switchPanel('...')"` attributes from the 75 sidebar items in lab.html
2. Remove the `forEach` listener block at lines 5035-5041
3. Add one delegated listener (5 lines)

Net: remove 75 attributes + 7 lines JS, add 5 lines JS. Cleaner, faster, and enables DQ-331 fix (href-less `<a>` → `<button>` conversion) without touching onclick attributes.

## Files
- `frontend/lab.html` (sidebar items lines 3179-3270, JS lines 5035-5041)
