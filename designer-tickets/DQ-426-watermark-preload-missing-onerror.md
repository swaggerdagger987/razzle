---
id: DQ-426
title: Watermark image preload missing onerror handler — silent watermark failure
priority: P2
category: UX / reliability
page: all pages with screenshot export
cycle: 54
---

## Problem

The watermark image preload (app.js:486-492) loads 6 agent SVG icons into `_wmImgCache` for use in `drawRazzleWatermark()`. The preload has no `onerror` handler:

```javascript
(function() {
  for (var i = 0; i < _wmAgentIcons.length; i++) {
    var img = new Image();
    img.src = _wmAgentIcons[i]; // ← no onerror
    _wmImgCache[_wmAgentIcons[i]] = img;
  }
})();
```

If any SVG fails to load (CDN issue, path change, deploy error), `drawRazzleWatermark()` silently skips the icon because the check `img.complete && img.naturalWidth > 0` fails. The user gets a screenshot with a partial or missing watermark. No error is logged, so the issue is invisible to both users and developers.

## Why it matters

The watermark is a brand touchpoint on every shared screenshot. A missing watermark means shared images on Reddit don't carry the razzle.lol attribution. It's also a debugging blind spot — no logging means this can break silently for weeks.

## Fix

Add onerror handler with console warning:

```javascript
img.onerror = function() {
  console.warn('[razzle] watermark asset failed to load:', this.src);
};
```

## Files
- `frontend/app.js` — lines 486-492
