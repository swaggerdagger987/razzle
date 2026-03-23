# DQ-019: Konami confetti uses hardcoded position color hex values

**Priority**: P3 — Easter egg feature only
**Category**: Color token

## Problem

`frontend/app.js` line 1741 hardcodes position color hex values for the Konami code confetti animation:

```js
c.style.background = ["#d97757","#5b7fff","#2ec4b6","#8b5cf6","#ffc857"][i % 5];
```

These are the correct brand colors but hardcoded — they won't adapt if CSS variables change and they bypass the token system.

## Fix

Read colors from CSS at runtime:
```js
const s = getComputedStyle(document.documentElement);
const colors = [
  s.getPropertyValue('--orange').trim(),
  s.getPropertyValue('--blue').trim(),
  s.getPropertyValue('--green').trim(),
  s.getPropertyValue('--purple').trim(),
  s.getPropertyValue('--yellow').trim()
];
c.style.background = colors[i % 5];
```

## Verification

Trigger the Konami code (up up down down left right left right B A). Confetti colors should match the current theme's accent palette.
