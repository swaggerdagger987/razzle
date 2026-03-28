---
id: S2-084
severity: S2
confidence: HIGH
category: performance
source: DQ-338
status: OPEN
---

# Lab sidebar 75 inline onclick handlers — not event-delegated

## Root Cause

`frontend/lab.html:3185-3291` — 75 sidebar panel items each have inline `onclick="switchPanel('...')"` handlers. This:
- Adds 75 individual function closures to the DOM
- Makes sidebar HTML 2x larger than necessary
- Prevents event delegation (one listener on parent)
- Is the root cause of S1-029 (no href = keyboard dead)

## Fix

Replace all inline `onclick` with a single delegated event listener on the sidebar container:

```js
document.querySelector('.lab-sidebar').addEventListener('click', function(e) {
  const item = e.target.closest('[data-panel]');
  if (item) switchPanel(item.dataset.panel);
});
```

Remove all `onclick="..."` from sidebar `<a>` elements.

## Files

- `frontend/lab.html:3185-3291` — 75 inline onclick handlers

## Acceptance Criteria

- Zero inline onclick on sidebar items
- Single delegated click listener on sidebar container
- All panel switching still works
