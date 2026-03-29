# S3-025: JS animations ignore prefers-reduced-motion

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #25
**WCAG**: 2.3.3 (Animation from Interactions)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/styles.css:1426-1433` correctly disables CSS animations via `prefers-reduced-motion: reduce`. However, JavaScript-driven animations are not affected:

- Toast slide-in/fade-out (app.js ~line 347-361)
- Command palette opening animation
- Bulk action bar slideUp animation
- Hover lift effects applied via JS

## Fix

Check the media query in JS and skip or reduce animations:
```javascript
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In toast creation:
if (prefersReducedMotion) {
  toast.style.transition = 'none';
}

// In any JS animation:
if (prefersReducedMotion) {
  element.style.transition = 'none';
}
```

## Files to Change

- `frontend/app.js` — toast creation function, command palette open
- `frontend/lab.js` — bulk action bar animation, any hover effects applied via JS

## Accept When

1. `window.matchMedia('(prefers-reduced-motion: reduce)')` is checked before JS animations
2. Animations are instant (no transition/transform animation) when reduced motion is preferred
3. Functionality is preserved — elements still appear/disappear, just without animation
