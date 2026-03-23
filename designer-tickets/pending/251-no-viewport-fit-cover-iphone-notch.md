# DES-251: No viewport-fit=cover or safe-area padding for iPhone notch

**Priority**: P2
**Area**: sitewide (all 75 pages)
**Cycle**: 24

## Problem

All 75 pages use:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Missing `viewport-fit=cover`. On modern iPhones (notch, Dynamic Island) in landscape mode or when added to home screen, content can be obscured by the notch/home indicator. The topnav and footer have no `env(safe-area-inset-*)` padding.

Target audience is 22-40, tech-comfortable — high iPhone ownership. DES-172 notes zero manifest/apple-touch-icon (can't install as PWA). But even in Safari full-screen (swipe up from bottom bar), safe-area insets matter.

## Evidence

- `grep -r "viewport-fit" frontend/` = 0 matches
- `grep -r "safe-area-inset" frontend/` = 0 matches
- All 75 pages have the same viewport meta without `viewport-fit=cover`

## Fix

1. Update viewport meta on all pages:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

2. Add safe-area padding to nav and footer in styles.css:
```css
.topnav { padding-left: max(24px, env(safe-area-inset-left)); padding-right: max(24px, env(safe-area-inset-right)); }
.site-footer { padding-bottom: max(24px, env(safe-area-inset-bottom)); }
body { padding-top: env(safe-area-inset-top); }
```

## Why This Matters

iPhone users in landscape mode or with the home screen bookmark see content partially hidden behind the notch. This is a polish signal — competing tools (KeepTradeCut, Dynasty Daddy) handle this correctly.
