---
id: DQ-145
priority: P2
area: performance
section: images
type: perf-optimization
status: open
---

# No fetchpriority="high" on above-fold images (0 instances sitewide)

## What's wrong

`fetchpriority="high"` tells the browser to prioritize loading the Largest Contentful Paint (LCP) image over other resources. Zero images across 75 pages use this attribute. The hero mascot SVG, agent icons in the sidebar, and above-fold decorative images all compete equally with offscreen images for bandwidth.

## Where

- 0 instances of `fetchpriority` in any frontend file
- 38 `<img>` tags across 23 HTML files (all without `fetchpriority`)
- 8 JS-created images in app.js, lab.js, warroom.js (all without `fetchpriority`)

## Fix

Add `fetchpriority="high"` to above-fold hero images on key landing pages:

- `lab.html` — sidebar agent icons (lines 3211-3282) are above-fold but small; the main LCP is likely the table, so skip
- `agents.html` — hero mascot image (if any), agent bio cards
- `index.html` — hero section imagery

Add `fetchpriority="low"` to below-fold decorative images:

- `loading="lazy"` images that also appear in sidebars/footers

## Why this matters

Without fetchpriority hints, the browser downloads all images with equal priority. On slower connections, the LCP image competes with 20+ offscreen images, delaying the perceived page load. This is a Core Web Vitals signal that affects SEO ranking.
