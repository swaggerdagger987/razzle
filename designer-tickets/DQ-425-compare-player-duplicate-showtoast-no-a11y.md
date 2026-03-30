---
id: DQ-425
title: Compare and Player pages define own showToast — missing a11y, bypasses design system
priority: P2
category: UX consistency / accessibility
page: compare.html, player pages
cycle: 54
---

## Problem

`compare.js:892` and `player.js:804` each define their own `showToast()` function with full inline styles, even though `app.js` provides `_showToast()` which is loaded on both pages. The duplicate implementations:

1. **Missing accessibility**: No `role="alert"`, no `aria-live="assertive"` (the centralized `_showToast` has both)
2. **Never removed from DOM**: They set `opacity: 0` to hide but never call `.remove()` — the old toast div stays in the DOM forever
3. **Bypass design system**: Hardcoded `border-radius: 8px`, `font-size: 14px`, `z-index: 10000` instead of using CSS classes
4. **No error/warning types**: The centralized toast supports `type` parameter for color-coded borders; these don't

## Evidence

```javascript
// compare.js:892 — duplicate implementation
function showToast(msg) {
  var toast = document.getElementById("compareToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "compareToast";
    toast.style.cssText = "position:fixed; bottom:24px; ..."
    // ← no role="alert", no aria-live
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(function() { toast.style.opacity = "0"; }, 2500);
  // ← never .remove()'d
}
```

Both pages load `app.js` which provides `_showToast()` with all the above handled correctly.

## Fix

Delete `showToast` from `compare.js` and `player.js`. Replace all calls with `_showToast()`.

## Files
- `frontend/compare.js` — lines 892-907
- `frontend/player.js` — lines 804-820
