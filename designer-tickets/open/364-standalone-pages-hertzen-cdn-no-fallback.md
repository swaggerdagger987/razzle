---
id: DQ-364
priority: P3
area: 50+ standalone HTML pages
section: external dependency
type: reliability / single point of failure
status: open
---

# 50+ pages depend on html2canvas.hertzen.com CDN with no fallback

## What's wrong

All standalone pages load html2canvas from `https://html2canvas.hertzen.com/dist/html2canvas.min.js` — a personal domain, not a major CDN. If hertzen.com goes down, every export/screenshot button on every standalone page breaks silently.

lab.js:106 uses the same URL for its lazy-load. No page has a fallback CDN or error handler for script load failure.

## Where

50+ `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>` tags across all standalone pages, plus lab.js:106.

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
