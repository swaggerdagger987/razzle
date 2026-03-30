# DES-177: Google Fonts CSS render-blocks first paint on 75 pages

**Priority**: P1 — Performance (affects every page load for every user)
**Scope**: All 75 HTML pages
**Category**: Performance UX

## Problem

Every HTML page loads Google Fonts via a render-blocking `<link rel="stylesheet">`:

```html
<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
```

The browser will NOT paint any content until this external CSS file downloads. On slow mobile connections (62% of Twitter/Reddit traffic), users see a blank page for 200-800ms while the browser fetches this CSS from Google's servers. The `display=swap` parameter prevents invisible text (FOIT) but only AFTER the CSS loads — the CSS itself is what blocks rendering.

## Evidence

- 75 HTML files each contain this render-blocking `<link rel="stylesheet">` for Google Fonts
- `preconnect` hints are in place (good) but don't eliminate the blocking — they just start the connection earlier
- No `@font-face` declarations in the codebase — fonts are entirely loaded via the Google Fonts external stylesheet

## Fix

Change the font loading pattern from render-blocking to non-blocking on all 75 pages:

```html
<!-- Non-blocking font load -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600;700&display=swap"></noscript>
```

Or the simpler `media="print"` trick:
```html
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" media="print" onload="this.media='all'">
```

Keep the `preconnect` hints. The `display=swap` in the URL handles text visibility during font load.

## Why this matters

The home page is the first impression for every Twitter/Reddit click-through. A blank page — even for 300ms — signals "slow" and triggers bounce. This is the single highest-leverage performance fix: one pattern change, 75 pages faster, zero visual regression (fonts still load, just non-blocking).
