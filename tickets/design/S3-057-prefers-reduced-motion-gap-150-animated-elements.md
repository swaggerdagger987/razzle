---
id: S3-057
severity: S3
confidence: HIGH
category: a11y
source: DQ-093,DQ-139,DQ-450
status: OPEN
---

# prefers-reduced-motion — only 1 CSS rule, 150+ animated elements unprotected

## Root Cause

`frontend/styles.css` has a single `@media (prefers-reduced-motion: reduce)` rule that disables CSS transitions. But:

- 150+ elements with CSS animations are unprotected
- JS animations (toast slide, cmd palette fade, bulk bar, agent nudges) don't check the media query
- 404 tiger walk animation has no reduced-motion guard (DQ-139)
- agent-nudges.js animations bypass the check entirely (DQ-450)

## Fix

1. Expand the CSS media query to cover all `animation` properties:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

2. Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in JS before animating.

## Files

- `frontend/styles.css` — media query
- `frontend/app.js` — toast, cmd palette animations
- `frontend/lab.js` — bulk bar animation
- `frontend/agent-nudges.js` — nudge animations
- `frontend/404.html` — tiger walk

## Acceptance Criteria

- Users with reduced-motion preference see no animations
- All CSS animations and JS animations respect the preference
