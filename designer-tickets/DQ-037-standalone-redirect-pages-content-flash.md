# DQ-037: Standalone redirect pages show flash of Pro gate content

**Priority**: P2 — UX polish
**Pages**: stocks.html, reportcard.html, tradefinder.html, and other standalone redirecting pages
**Category**: UX / loading

## Problem

Standalone pages like stocks.html contain a JS redirect:
```html
<script>if(window.self===window.top) window.location.replace('/lab.html?panel=stocks');</script>
```

Before this redirect fires, the page briefly renders its own HTML content — typically a "STOCK WATCH IS A PRO PANEL" heading with a lock icon and "See Plans" button. This creates a flash of unrelated content before the Lab loads.

The flash content has no card container or chunky border styling — it's bare text floating on the background, which looks unfinished.

## Evidence

- Screenshot of stocks.html (dark mode): heading + button float on uniform dark background with no card container
- The redirect happens after DOM render, causing a visible flash
- Every standalone page with this pattern has the same issue

## Fix

Hide the body until redirect fires:
```html
<style>body { display: none; }</style>
<script>
  if (window.self === window.top) {
    window.location.replace('/lab.html?panel=stocks');
  } else {
    document.body.style.display = '';
  }
</script>
```
This prevents any content flash. If the page is in an iframe (Lab embed), it shows normally.
