# DES-239: Hardcoded year cap 2025 in app.js tagline — wrong in 2026

**Priority:** P1 — user-facing copy bug
**Page:** sitewide (app.js loaded on every page)
**Cycle:** 23

## Problem

app.js:1772:
```javascript
"pulling film since " + Math.min(new Date().getFullYear(), 2025) + ".",
```

This is one of the rotating tagline strings shown in the console Easter egg. `Math.min(currentYear, 2025)` caps the year at 2025. In 2026, it displays "pulling film since 2025" — which is wrong and will get more wrong every year.

## Fix

Remove the cap entirely:
```javascript
"pulling film since " + new Date().getFullYear() + ".",
```

Or use a fixed founding year if the intent is "we've been around since":
```javascript
"pulling film since 2025.",
```

## Why this matters

Minor in isolation — it's a console Easter egg. But curious users (the exact tech-savvy dynasty managers Razzle targets) DO open DevTools. A wrong year in the console makes the product feel stale. One-line fix.
