# DES-162: 19 images missing `loading="lazy"` across 6 files

**Priority**: P2 (Page performance — bounce rate)
**Page**: agents.html, lab.html, matchups.html, rosterbuilder.html, scoring.html, tradefinder.html
**Category**: Performance

## The Problem

50% of all `<img>` tags in the codebase (19 of 38) lack `loading="lazy"`. These images are fetched eagerly on page load even if they're below the fold, increasing initial page weight and Time to Interactive.

## Evidence

Files with images missing `loading="lazy"`:
- **agents.html**: 2 images (logo, agent icons)
- **lab.html**: 8 images (agent category icons in sidebar)
- **matchups.html**: 1 image
- **rosterbuilder.html**: 1 image
- **scoring.html**: 1 image
- **tradefinder.html**: 4 images

19 images with `loading="lazy"` (correctly set) exist across other pages — so the pattern IS established, just not applied everywhere.

## The Fix

Add `loading="lazy"` to all below-fold images. Exception: the first visible image on each page (logo, hero image) should keep eager loading for LCP optimization.

```html
<!-- Below-fold images -->
<img src="..." alt="..." loading="lazy">

<!-- Above-fold / LCP images — keep eager (default) -->
<img src="..." alt="...">
```

## Why This Matters

Twitter and Reddit traffic is mobile-heavy (62%+). Mobile connections are slower. Every unnecessary image request on initial load increases bounce rate. The Lab page (lab.html) has 8 agent icons in the sidebar that don't need to load until the sidebar is scrolled — that's 8 wasted network requests on every page load of the growth engine.
