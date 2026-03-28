---
id: S2-086
severity: S2
confidence: HIGH
category: performance
source: DQ-177
status: OPEN
---

# Google Fonts CSS render-blocks first paint on 75 pages

## Root Cause

Every HTML page loads Google Fonts via a render-blocking `<link rel="stylesheet">`:

```html
<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
```

Example: `frontend/agents.html:26`, `frontend/404.html:25`, and all 73 other pages.

The browser will NOT paint any content until this external CSS file downloads. On slow mobile connections (majority of Twitter/Reddit traffic), users see a blank page for 200-800ms while the browser fetches CSS from Google's servers. `display=swap` prevents invisible text (FOIT) but only AFTER the CSS loads — the CSS itself is what blocks rendering.

Preconnect hints are in place but don't eliminate the blocking — they just start the connection earlier.

## Fix

Change font loading from render-blocking to non-blocking on all 75 pages:

```html
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?..."></noscript>
```

Keep the existing `preconnect` hints.

## Files

- All 75 HTML files in `frontend/` — `<link rel="stylesheet">` for Google Fonts (typically line 25-27)

## Acceptance Criteria

- Google Fonts load non-blocking (media="print" trick or rel="preload" with onload)
- Noscript fallback present for no-JS users
- First paint no longer blocked by external CSS fetch
- Fonts still render correctly after async load (display=swap handles FOUT)
