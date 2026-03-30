# DES-250: Zero preload hints for critical above-the-fold resources

**Priority**: P2
**Area**: sitewide (all 75 pages)
**Cycle**: 24

## Problem

Zero `<link rel="preload">` or `<link rel="prefetch">` hints exist in any page. The browser discovers critical resources only after parsing HTML:

1. `styles.css` — discovered at line 27, blocks rendering
2. Google Fonts CSS — discovered at line 26, blocks rendering (DES-177)
3. `app.js` — discovered at end of body, blocks interactivity

Adding `<link rel="preload" as="style" href="styles.css">` in `<head>` before other tags lets the browser start downloading immediately while still parsing. Same for the font CSS.

## Evidence

- `grep -r "preload\|prefetch\|modulepreload" frontend/index.html` = 0 matches
- `grep -r "rel=\"preload\"" frontend/` = 0 matches across all 75 pages
- `preconnect` hints for Google Fonts DO exist (good) — but preload for own CSS doesn't

## Fix

Add to `<head>` on all pages, before the `<link rel="stylesheet">` tags:

```html
<link rel="preload" as="style" href="styles.css">
```

For the home page (highest LCP priority):
```html
<link rel="preload" as="script" href="app.js">
```

## Why This Matters

Every millisecond of LCP matters for mobile users (62% of traffic). Preload hints are free performance — zero runtime cost, browser starts downloading immediately instead of waiting for parser to reach the `<link>` tag. This stacks with DES-177 (font loading) for a combined improvement.
