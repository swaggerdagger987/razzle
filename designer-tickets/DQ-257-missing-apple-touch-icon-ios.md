---
id: DQ-257
title: No apple-touch-icon — iOS home screen shows generic browser icon
priority: P3
category: meta / mobile
status: open
cycle: 35
---

## Problem

No `<link rel="apple-touch-icon">` in any of the 75 HTML pages. When a user adds razzle.lol to their iOS home screen, they get a generic Safari icon instead of the Razzle brand.

For a tool that targets mobile-heavy fantasy football users, this is a missed branding opportunity.

## Evidence

`grep -r "apple-touch-icon" frontend/` returns 0 results.

## Fix

1. Create a 180x180px PNG of the Razzle tiger mascot (or use the existing favicon SVG converted to PNG)
2. Save as `frontend/apple-touch-icon.png`
3. Add to all HTML files after the favicon link:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Files
- Create `frontend/apple-touch-icon.png`
- 75 HTML files in `frontend/` — add link tag

## Impact
Mobile branding. Fantasy football is heavily mobile. Users who bookmark the site to home screen should see the tiger.
