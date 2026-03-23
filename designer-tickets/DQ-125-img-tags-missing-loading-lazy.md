# DQ-125: 19 of 38 img tags missing loading="lazy" — unnecessary initial page weight

**Priority**: P3 — MEDIUM
**Category**: Performance
**Scope**: 75 HTML files

## Problem

50% of static `<img>` tags across HTML files don't have `loading="lazy"`. Below-the-fold images (mascot in lower sections, panel previews, team logos) load eagerly on initial page render, adding unnecessary network requests to first paint.

## What to fix

Add `loading="lazy"` to all `<img>` tags that are NOT in the first visible viewport (hero section). Keep eager loading only for:
- Navigation logo
- Hero section mascot image
- Any image that appears above the fold at 1440x900

Everything else gets `loading="lazy"`.

## Impact

On slower connections (3G, Render cold start), 19 unnecessary image requests compete with critical CSS and JS for bandwidth. Lazy loading is zero-risk — supported by all modern browsers, gracefully ignored by older ones.

## Fix

Mechanical: grep all HTML files for `<img` without `loading="lazy"`, add the attribute. Skip the first `<img>` per page (likely above fold).
