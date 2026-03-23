# DES-261: Welcome modal confetti ignores prefers-reduced-motion

**Priority:** P2
**Category:** Accessibility / Motion
**Affects:** app.js (lines 817-827)
**Cycle:** 25

## Problem

The post-checkout welcome modal creates 20 animated confetti particles with CSS `@keyframes welcome-confetti` animation. This animation runs unconditionally — it does NOT check `prefersReducedMotion` (which IS defined at app.js line 25 and used by `_showToast` at line 548).

Users with vestibular disorders or motion sensitivity who set `prefers-reduced-motion: reduce` in their OS still get 20 flying/rotating particles. WCAG 2.3.3 (AAA) requires motion to respect user preferences.

## Why This Matters

This fires at the exact moment a user has just PAID. The celebration moment should feel good for everyone. Users with motion sensitivity experience it as disorienting instead of delightful. The pattern for checking this already exists in the codebase (`prefersReducedMotion` variable).

## Fix

In `_showWelcomeModal()` at app.js ~line 817, wrap the confetti loop:

```javascript
if (!prefersReducedMotion) {
  // CSS confetti burst
  var style = document.createElement("style");
  // ... existing confetti code ...
}
```

The modal itself, text, and buttons still appear — only the flying particles are suppressed.

## Scope

app.js — wrap 10 lines in an `if` check. The variable already exists.
