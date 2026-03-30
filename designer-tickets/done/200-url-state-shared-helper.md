<!-- PM: ready -->
---
id: DES-443a
parent: 443 (URL State Epic)
priority: P2
area: frontend/app.js
section: shared utilities
type: feature
status: open
---

# Add shared savePageState() / restorePageState() helpers to app.js

**File**: `frontend/app.js`

## What to do

Add reusable URL state helpers for standalone pages:

```javascript
function savePageState(params) {
  var sp = new URLSearchParams();
  Object.keys(params).forEach(function(k) {
    if (params[k] != null && params[k] !== '') sp.set(k, params[k]);
  });
  var qs = sp.toString();
  history.replaceState(null, '', qs ? '?' + qs : location.pathname);
}

function restorePageState(defaults) {
  var sp = new URLSearchParams(location.search);
  var result = {};
  Object.keys(defaults).forEach(function(k) {
    result[k] = sp.get(k) || defaults[k];
  });
  return result;
}
```

## Accept when

- `savePageState()` and `restorePageState()` exist in app.js
- Handles empty params, missing keys, default values
- Lab screener's existing URL state logic is NOT affected
