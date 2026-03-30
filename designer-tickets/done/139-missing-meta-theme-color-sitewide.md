# DES-139: Missing meta theme-color on all 75 pages

**Priority:** P2 — Mobile Polish / Brand
**Component:** All HTML pages
**Affects:** Mobile browser address bar color on Android Chrome and Safari

## Problem

No page in the frontend has `<meta name="theme-color">`. This meta tag controls the browser address bar / status bar color on mobile devices:

- Android Chrome: colors the URL bar and task switcher
- iOS Safari: colors the status bar area
- Desktop Chrome: colors the title bar in some configurations

Without it, the browser chrome stays its default color (white or gray), breaking the "warm sand everywhere" immersion. When a user opens razzle.lol from a Twitter link on their phone, the address bar is a cold default instead of the warm `#ede0cf` sand.

## Evidence

- Zero instances of `theme-color` in any frontend file (confirmed via grep)
- All 75 HTML pages have `<meta name="viewport">` but no `<meta name="theme-color">`
- DESIGN.md specifies `--bg: #ede0cf` (light) and `--bg: #2d1f14` (dark)

## Fix

Add to the `<head>` of every HTML page:

```html
<meta name="theme-color" content="#ede0cf" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#2d1f14" media="(prefers-color-scheme: dark)">
```

Or add a single `<meta name="theme-color" content="#ede0cf">` and update it via JS when dark mode toggles:

```javascript
document.querySelector('meta[name="theme-color"]').content = isDark ? '#2d1f14' : '#ede0cf';
```

## Why it matters

Every competing tool (Sleeper, Dynasty Nerds) has theme-color. It's the first visual signal that this is a polished product. Razzle's entire brand is warm sand — the browser chrome should match. 3-line fix across 75 pages (or 1 line in the template if using a shared head).
