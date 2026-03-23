---
id: DQ-141
priority: P1
area: responsive
section: mobile-viewport
type: mobile-bug
status: open
---

# 100vh without dvh fallback in styles.css (3 instances)

## What's wrong

`100vh` on mobile Safari/Chrome includes the browser address bar, causing content to be taller than the visible viewport. The fix is adding `100dvh` as a progressive enhancement (browsers that support it use it, others fall back to `100vh`). Lab.html already does this correctly at lines 966-967 — styles.css does not.

## Where (3 instances, 1 file)

- `styles.css:147` — `body { min-height: 100vh; }` (missing `min-height: 100dvh;`)
- `styles.css:271` — `.mobile-nav-overlay { height: 100vh; }` (missing `height: 100dvh;`)
- `styles.css:286` — `.mobile-nav-panel { height: 100vh; }` (missing `height: 100dvh;`)

## Fix

For each instance, add the dvh line AFTER the vh line (progressive enhancement):

```css
/* body */
min-height: 100vh;
min-height: 100dvh;

/* mobile-nav-overlay */
height: 100vh;
height: 100dvh;

/* mobile-nav-panel */
height: 100vh;
height: 100dvh;
```

## Reference

Lab.html lines 966-967 already implement this correctly:
```css
height: 100vh;
height: 100dvh;
```

## Why this matters

On mobile Safari, the mobile nav panel and overlay are ~75px taller than the visible screen. The overlay doesn't fully cover the viewport, and the panel's bottom content is unreachable behind the browser chrome.
