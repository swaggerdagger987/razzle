---
id: S2-039
severity: S2
category: frontend
title: SVG favicon has no PNG fallback — older browsers and bookmark managers show blank
source: deep-audit
status: open
---

## Problem

The site uses `favicon.svg` as the favicon. While modern browsers support SVG favicons, some older browsers, bookmark managers, and mobile browsers show a blank icon without a PNG fallback.

## Root Cause

All 75 HTML files reference only `favicon.svg` at **line 23** (or line 22 for `404.html`):
```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

Examples:
- `frontend/about.html:23`
- `frontend/advantage.html:23`
- `frontend/agents.html:23`
- `frontend/aging.html:23`
- `frontend/404.html:22` (uses absolute path `/favicon.svg`)

No `<link rel="icon" type="image/png">` fallback exists in any file. No `favicon.png` file exists in the `frontend/` directory.

## Fix

1. Generate a 32x32 PNG version of the favicon from the SVG
2. Add `<link rel="icon" type="image/png" href="/favicon.png">` alongside the SVG favicon in all HTML files (or in the shared head template)
3. Keep the SVG as the primary favicon for modern browsers

## Accept When

- A `favicon.png` file exists in `frontend/`
- All HTML files include both SVG and PNG favicon links
- The favicon appears correctly in Chrome, Firefox, Safari, and Edge
