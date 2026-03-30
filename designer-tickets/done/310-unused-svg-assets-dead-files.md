<!-- PM: ready -->
---
id: DQ-434
priority: P3
area: frontend/assets/
section: housekeeping / repo hygiene
type: dead code
status: open
cycle: 56
---

# 3 unused SVG assets in repo — dead files bloating the repo

## What's wrong

Three SVG files in `frontend/assets/` are never referenced by any HTML, JS, or CSS file:

1. `frontend/assets/og-image.svg` — PNG version (`og-image.png`) is used in all og:image meta tags
2. `frontend/assets/og-image-lab.svg` — PNG version (`og-image-lab.png`) is used instead
3. `frontend/assets/research-sprawl.svg` — not referenced anywhere (was it a removed feature?)

## Evidence

Grep for each filename across all frontend files returns zero matches (excluding the asset directory itself). The PNG versions of the first two are actively referenced in all 75 HTML files.

## Fix

Delete the 3 unused SVG files:
```bash
rm frontend/assets/og-image.svg
rm frontend/assets/og-image-lab.svg
rm frontend/assets/research-sprawl.svg
```

## Why this matters

Dead files confuse contributors and add noise. research-sprawl.svg was flagged in DQ-419 as invisible in dark mode — but the root cause is it's not used at all.
