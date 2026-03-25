<!-- PM: ready -->
---
id: DQ-361a
parent: 361 (Error Messages Bypass razzleError)
priority: P2
area: frontend/app.js
section: shared utilities
type: brand voice / DRY
status: open
---

# Add shared razzleErrorHTML() function to app.js

**File**: `frontend/app.js`

## What to do

Add a function that wraps razzleError() in a styled container with an optional retry button:

```javascript
function razzleErrorHTML(retryFn) {
  return `<div style="text-align:center;padding:40px;font-family:var(--font-hand);font-size:22px;color:var(--red);">
    ${razzleError()}
    ${retryFn ? `<button class="btn-chunky" onclick="${retryFn}" style="margin-left:12px">retry</button>` : ''}
  </div>`;
}
```

This function will be consumed by DQ-361b through DQ-361d.

## Accept when

- `razzleErrorHTML()` exists in app.js near `razzleError()`
- Calling with no args returns error block without retry button
- Calling with a function name string returns error block with retry button
- Uses `var(--red)` and `var(--font-hand)` consistently
