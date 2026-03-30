---
id: DQ-332
title: Invalid ?panel= URL parameter causes persistent blank screen
priority: P1
category: ux/navigation
page: lab.html
cycle: 44
---

## Problem

`switchPanel()` in lab.html does not validate panel names. Visiting `/lab.html?panel=foobar`:

1. `showNewPanel()` hides ALL panels (lines 4441-4444)
2. `panelRegistry['foobar']` is undefined → `if (entry)` block is skipped
3. No panel is shown → **blank main area**
4. `currentPanel` is set to `'foobar'` (line 4542)
5. `localStorage.setItem('razzle_last_panel', 'foobar')` (line 4545) → **persists the bad state**

On the user's NEXT visit (even without the bad URL), `_initPanel()` reads `'foobar'` from localStorage and calls `switchPanel('foobar')` again → **persistent blank screen until localStorage is manually cleared**.

## How users hit this

- Bookmarked URL from a panel that was later renamed
- Shared URL with a typo
- SEO bot sends traffic to a crawled-but-renamed panel URL
- Any link with `?panel=` where the panel name doesn't match the registry

## Expected

Unknown panel names should fallback to the screener, not produce a blank screen.

## Fix

Add validation at the top of `switchPanel()`:

```js
window.switchPanel = function(panelName) {
  // Validate: unknown panels fallback to screener
  if (panelName !== 'screener' && !panelRegistry[panelName] && !FREE_PANELS[panelName]) {
    panelName = 'screener';
  }
  if (panelName === currentPanel) return;
  // ... rest of function
```

Also validate in `_initPanel()` before calling `switchPanel()`:

```js
function _initPanel() {
  var initPanel = params.get('panel');
  if (!initPanel) {
    try { initPanel = localStorage.getItem('razzle_last_panel'); } catch(e) {}
  }
  // Validate panel name exists in registry
  if (initPanel && initPanel !== 'screener' && !panelRegistry[initPanel]) {
    initPanel = null; // fallback to screener
  }
  if (initPanel && initPanel !== 'screener') {
    switchPanel(initPanel);
  }
}
```

## Files
- `frontend/lab.html` (lines 4412 `switchPanel`, 4983 `_initPanel`)
