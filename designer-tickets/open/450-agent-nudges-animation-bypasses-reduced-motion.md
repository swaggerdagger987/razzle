---
id: DES-450
priority: P2
area: accessibility
section: agent nudges
type: a11y-violation
status: open
---

# agent-nudges.js animation bypasses prefers-reduced-motion

## What's wrong

Agent nudge elements use `animation:nudgeFadeIn 0.4s ease-out` applied via inline `style.cssText`. This animation runs regardless of the user's `prefers-reduced-motion` setting.

DQ-102 (done) added `prefersReducedMotion` checks to app.js, lab.js, and warroom.js — but missed agent-nudges.js entirely.

## Where

`frontend/agent-nudges.js`:
- Line 121: `@keyframes nudgeFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`
- Line 159: `el.style.cssText = "...animation:nudgeFadeIn 0.4s ease-out;"`

No `prefers-reduced-motion` check anywhere in the file.

## Fix

Check the shared utility before applying animation:

```javascript
var motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
el.style.cssText = "display:flex; align-items:center; gap:8px; padding:8px 14px; margin:8px 0; border:2px solid " + safeColor + "; border-radius:8px; background:var(--bg-card); font-size:13px;" + (motion ? " animation:nudgeFadeIn 0.4s ease-out;" : "");
```

Or add a CSS-level override in the keyframe injection:
```javascript
s.textContent = "@keyframes nudgeFadeIn { ... } @media (prefers-reduced-motion: reduce) { .agent-nudge { animation: none !important; } }";
```

## Why it matters

WCAG 2.3.3 (Animation from Interactions). Users who've opted into reduced motion via OS settings expect ALL animations to respect that choice. Agent nudges fire during active Lab usage — repeated 0.4s translate animations are exactly the kind of motion that triggers vestibular issues.
