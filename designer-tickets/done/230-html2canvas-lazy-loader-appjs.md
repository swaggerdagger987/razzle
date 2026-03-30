<!-- PM: ready -->
---
id: DQ-359a
parent: 359 (html2canvas Sync Load Sitewide)
priority: P2
area: frontend/app.js
section: shared utilities
type: performance
status: open
---

# Add shared loadHtml2Canvas() lazy loader to app.js

**File**: `frontend/app.js`

## What to do

Add a shared function that lazy-loads html2canvas on first use:

```javascript
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const s = document.createElement('script');
    s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    s.onload = () => resolve(window.html2canvas);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
```

This function will be consumed by DQ-359b through DQ-359d.

## Accept when

- `loadHtml2Canvas()` exists in app.js
- Calling it twice returns the cached instance (no double script injection)
- Returns a Promise that resolves to window.html2canvas
