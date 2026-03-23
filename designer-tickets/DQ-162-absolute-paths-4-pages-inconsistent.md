# DQ-162: 4 pages use absolute asset paths while 71 use relative

**Priority:** P3
**Area:** Architecture / Consistency
**Type:** Inconsistency
**Impact:** Could break if deployed to subdirectory or CDN; confusing for contributors

---

## Problem

4 pages use absolute paths (`/styles.css`, `/app.js`, `/favicon.svg`) while the other 71 HTML pages use relative paths (`styles.css`, `app.js`). This inconsistency is a maintenance hazard.

### Absolute path pages
- `404.html` — `/styles.css`, `/favicon.svg`, `/app.js`
- `compare.html` — `/styles.css`, `/favicon.svg`, `/app.js`, `/compare.js`
- `player.html` — `/styles.css`, `/favicon.svg`, `/app.js`, `/player.js`
- `team.html` — `/styles.css`, `/favicon.svg`, `/app.js`

### All other 71 pages use
- `styles.css` (relative)
- `favicon.svg` (relative)
- `app.js` (relative)

## Why it matters

These 4 pages may work because the server serves from root. But if the deployment structure ever changes (CDN prefix, subdirectory), these 4 will break while the other 71 continue working.

## Fix

Change all absolute paths to relative in the 4 files:
- `/styles.css` -> `styles.css`
- `/favicon.svg` -> `favicon.svg`
- `/app.js` -> `app.js`
- `/compare.js` -> `compare.js`
- `/player.js` -> `player.js`

## Verification
- Load each of the 4 pages — CSS and JS should still load correctly.
