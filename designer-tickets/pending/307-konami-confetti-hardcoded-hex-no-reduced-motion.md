---
id: DES-307
title: Konami confetti uses hardcoded hex colors and ignores prefers-reduced-motion
priority: P2
page: app.js
category: Design System / Accessibility
cycle: 28
---

## Problem

The Konami Code easter egg confetti (app.js:1738-1750) uses hardcoded hex color array:
```js
c.style.background = ["#d97757","#5b7fff","#2ec4b6","#8b5cf6","#ffc857"][i % 5];
```

The welcome modal confetti (app.js:821) was already fixed to use CSS vars:
```js
var colors = ["var(--orange)", "var(--pos-qb)", "var(--pos-rb)", "var(--pos-te)", "var(--green)"];
```

Same file, same type of confetti, different approach. The Konami version also:
1. Uses the Web Animations API (`element.animate()`), which bypasses the CSS `@media (prefers-reduced-motion)` rule at styles.css:1637
2. Spawns 50 particles (vs 20 for welcome confetti)
3. Never checks `prefersReducedMotion` (defined at app.js:25 and used by `_showToast`)

## Where

- `frontend/app.js` line 1741 — hardcoded hex array
- `frontend/app.js` line 1738-1750 — no reduced motion check
- `frontend/app.js` line 1754-1758 — logo spin also bypasses reduced motion

## Fix

1. Replace hex array with CSS vars (match welcome confetti pattern at line 821)
2. Guard the entire `_triggerKonami()` function body with `if (prefersReducedMotion) { _showToast(...); return; }`
3. Skip the logo spin for reduced motion users too

## Evidence

- app.js:821 uses `var(--orange)` etc. ✅
- app.js:1741 uses `#d97757` etc. ❌
- app.js:25 defines `prefersReducedMotion` but `_triggerKonami` doesn't check it
