---
id: S2-018
severity: S2
category: design
title: "No PNG favicon fallback — SVG only"
status: open
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: frontend/S2-039-no-png-favicon-fallback.md
---

# S2-018: No favicon PNG fallback

## Finding

The site uses SVG favicon only. Some older browsers and bookmark managers don't support SVG favicons.

## Root Cause

All HTML files use SVG favicon at line 23:
```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

No PNG fallback (`<link rel="icon" type="image/png" href="/favicon.png">`) is present on any page.

Verified in: efficiency.html, consistency.html, schedule.html, vorp.html, airyards.html, breakouts.html — all SVG only.

## Fix

1. Generate `frontend/favicon.png` (32x32 and 16x16) from the existing SVG
2. Add PNG fallback line to all HTML files:
```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
```

## Impact

Minor. Most modern browsers support SVG favicons. Some bookmark managers and older mobile browsers may show a blank favicon.

## Acceptance Criteria

- [ ] favicon.png generated from SVG
- [ ] PNG fallback link added to all HTML files
