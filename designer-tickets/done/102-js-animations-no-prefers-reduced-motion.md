# DES-102: JS animations don't check prefers-reduced-motion

**Priority**: P2
**Area**: app.js, lab.js, warroom.js
**Cycle**: 10

## Problem

CSS animations correctly respect `prefers-reduced-motion` via a global media query in styles.css (line 1614). But 89 JS-based animation calls across 8 files never check the user's motion preference:

| File | Animation calls | What animates |
|------|----------------|---------------|
| lab.js | 46 | Smooth scroll, canvas drawing, requestAnimationFrame loops |
| app.js | 16 | Toast slide-in/out, modal transitions |
| warroom.js | 14 | Pixel agent movement, sprite animation, canvas rendering |
| lab-panels.js | 5 | Chart animations |
| player.js | 3 | Canvas drawing |
| formula-store.js | 2 | UI transitions |
| compare.js | 2 | Canvas drawing |

### Most impactful gaps

1. **warroom.js pixel engine** — sprite animation loops run continuously. Users with vestibular disorders or motion sensitivity get no relief.
2. **lab.js smooth scroll** — `requestAnimationFrame` scroll on page change. Should snap instantly when reduced motion is preferred.
3. **app.js toast slide** — toast notifications slide in with CSS transition triggered by JS class toggle. The CSS `transition-duration: 0.01ms` from the media query handles this, but the JS `setTimeout` that removes the toast after the transition still waits the full duration.

## Fix

Add a shared utility in app.js:

```javascript
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Then use it in the three highest-impact places:

### 1. warroom.js — skip sprite animation frames
```javascript
if (prefersReducedMotion) {
  // Draw agents at rest frame, no walking animation
  agent.frame = 0;
}
```

### 2. lab.js — skip smooth scroll
```javascript
if (prefersReducedMotion) {
  document.getElementById('labContent').scrollTop = 0;
} else {
  requestAnimationFrame(() => { /* smooth scroll */ });
}
```

### 3. app.js — instant toast (no slide delay)
```javascript
if (prefersReducedMotion) {
  toast.style.transition = 'none';
}
```

Don't need to fix every one of the 89 calls — focus on the visible, continuous animations.

## Design Rule

WCAG 2.3.3: Animation from Interactions. Users must be able to disable non-essential motion. The CSS media query handles CSS animations; JS animations need an equivalent check.
