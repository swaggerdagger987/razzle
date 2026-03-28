---
id: S3-107
severity: S3
confidence: HIGH
category: frontend
source: DQ-426
status: OPEN
---

# Watermark agent icon preload has no onerror handler

## Root Cause

Watermark agent icons are preloaded via `new Image()` without an `onerror` handler. If an SVG fails to load (network error, 404), the cached image object is still used in `drawRazzleWatermark()`, potentially causing silent rendering failures.

**File**: `frontend/app.js:578-584`

```javascript
(function() {
  for (var i = 0; i < _wmAgentIcons.length; i++) {
    var img = new Image();
    img.src = _wmAgentIcons[i];
    _wmImgCache[_wmAgentIcons[i]] = img;
  }
})();
```

The `img.complete && img.naturalWidth > 0` check at `app.js:592-595` partially mitigates this but doesn't handle all error states.

## Fix

Add `onerror` handler that removes the failed image from cache:

```javascript
img.onerror = function() { delete _wmImgCache[_wmAgentIcons[i]]; };
```

## Acceptance Criteria

- [ ] Failed image preloads are removed from `_wmImgCache`
- [ ] Watermark export still works when an agent icon fails to load (falls back to text-only)
