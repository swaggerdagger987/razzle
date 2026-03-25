<!-- PM: ready -->
---
id: DQ-364
priority: P3
area: frontend/app.js
section: external dependency
type: reliability / single point of failure
status: open
---

# Add fallback CDN to loadHtml2Canvas() in app.js

## What's wrong

The `loadHtml2Canvas()` lazy loader in app.js (shipped in commit dc639ba) loads from `html2canvas.hertzen.com` — a personal domain, not a major CDN. If hertzen.com goes down, every export/screenshot button breaks silently.

**NOTE**: The sync `<script>` tags were already removed sitewide (commit f0fc7e3). This ticket is now scoped to adding a fallback CDN URL to the existing lazy loader in app.js — a one-file change.

## Where

`frontend/app.js` — the `loadHtml2Canvas()` function.

## Suggested fix

When implementing the lazy-load from DQ-359, use a CDN with fallback:

```javascript
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.onerror = () => {
      // fallback to original
      const s2 = document.createElement('script');
      s2.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      s2.onload = () => resolve(window.html2canvas);
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s.onload = () => resolve(window.html2canvas);
    document.head.appendChild(s);
  });
}
```

Can be combined with DQ-359 (lazy-load).

## Why this matters

Single point of failure on a personal domain. jsdelivr is a production CDN with SLA. This is defense-in-depth.
