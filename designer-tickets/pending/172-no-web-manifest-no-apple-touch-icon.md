# DES-172: No web app manifest or apple-touch-icon

**Priority**: P3
**Category**: Mobile / PWA
**Affects**: All pages — missing from `<head>` sitewide
**Cycle**: 16

## Problem

1. **No `manifest.json`/`manifest.webmanifest`** exists anywhere in the project. Without it:
   - Chrome won't show "Install" or "Add to Home Screen" prompts
   - No PWA capability (offline caching, standalone mode)
   - Mobile users can't pin Razzle to their home screen as an app

2. **No `apple-touch-icon`** link in any `<head>`. Without it:
   - iOS users who "Add to Home Screen" get a generic page screenshot as the icon
   - Should show the Razzle tiger mascot

## Evidence

Zero manifest references in the entire frontend:
```
grep "manifest" frontend/*.html → 0 results
```

Zero apple-touch-icon references:
```
grep "apple-touch-icon" frontend/*.html → 0 results
```

Only `favicon.svg` exists — no PNG icon assets for home screen.

## Fix

1. Create `manifest.json` with name, icons, theme_color, background_color, display: "standalone"
2. Generate 180x180 and 512x512 PNG icons from the razzle.svg
3. Add to all pages:
```html
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/assets/icon-180.png">
```

## Why it matters

Dynasty power users visit Razzle daily during the season. Home screen pinning turns a website into a habit. The tiger icon on their phone screen is brand reinforcement every time they see their app drawer.
