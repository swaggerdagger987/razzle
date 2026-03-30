---
id: DQ-056
priority: P2
category: dark mode
pages: all 70+ pages
status: open
---

# Meta theme-color hardcoded to light mode on all pages

## What's wrong

Every page has `<meta name="theme-color" content="#ede0cf">` hardcoded in the `<head>`. When users toggle dark mode, the browser chrome (address bar, status bar on mobile) stays light sand `#ede0cf` instead of flipping to espresso `#2d1f14`.

This creates a jarring visual break: the page content goes dark but the browser frame stays light. On mobile Safari and Chrome, this is very noticeable.

## Evidence

- `grep 'theme-color' frontend/*.html` — all 70+ pages have identical `content="#ede0cf"`
- No JS exists to update the meta tag on theme toggle
- DESIGN.md line 62-72: dark mode flips `--bg` from `#ede0cf` to `#2d1f14`

## Fix

In `app.js` (the shared script loaded on all pages), add theme-color update to the dark mode toggle handler:

```javascript
function updateThemeColor() {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    meta.setAttribute('content', isDark ? '#2d1f14' : '#ede0cf');
  }
}
```

Call this whenever the theme toggles. Also call on page load if dark mode is persisted in localStorage.

## Files
- `frontend/app.js` (add theme-color update to existing dark mode toggle)
