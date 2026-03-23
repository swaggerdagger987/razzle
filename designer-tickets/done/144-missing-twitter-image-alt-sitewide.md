# DES-144: Missing twitter:image:alt meta tag on all pages

**Priority:** P3 — Social Sharing / Accessibility
**Component:** All HTML pages
**Affects:** Twitter/X card accessibility and fallback text

## Problem

Zero pages in the frontend have `<meta name="twitter:image:alt">`. This meta tag provides descriptive text for the OG image on Twitter/X cards:

- Screen reader users on Twitter see no description of the card image
- If the image fails to load (CDN issue, slow connection), there's no fallback text
- Twitter's accessibility guidelines recommend it

All pages already have `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` — the alt is the only missing piece.

## Evidence

- Zero matches for `twitter:image:alt` in any frontend file (confirmed via grep)
- `index.html:15-17` — Has `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `player.html:12-18` — Same set, no alt
- `compare.html:12-18` — Same set, no alt
- All 75 pages follow this pattern

## Fix

Add after the `twitter:image` meta tag on each page:

```html
<meta name="twitter:image:alt" content="Razzle — Free Fantasy Football Research Lab">
```

For player and compare pages, use more specific alt text:

```html
<!-- player.html -->
<meta name="twitter:image:alt" content="Razzle player analysis and stats">

<!-- compare.html -->
<meta name="twitter:image:alt" content="Razzle side-by-side player comparison">
```

## Why it matters

Twitter is the primary launch channel (Phase 1 of the roadmap). Every shared link generates a card. Making those cards accessible improves reach with screen reader users and provides graceful fallback when images fail to load. Low-effort, wide impact.
