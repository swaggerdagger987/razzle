---
id: DQ-229
title: md-pulse-dot uses infinite scale animation — battery/CPU drain on agent status indicators
priority: P3
category: performance
status: open
cycle: 32
---

## Problem

The `.md-pulse-dot` element in lab-panels.css runs an infinite 1.2s scale animation (`animation: md-pulse 1.2s ease-in-out infinite` with `transform: scale(0.8)` keyframes). This continuously triggers paint/composite cycles in the browser's rendering engine.

While a single dot is minor, these appear on agent status indicators in the Situation Room area. Combined with the Situation Room's pixel canvas (which already runs a requestAnimationFrame game loop), this adds unnecessary GPU work.

This is a SPECIFIC instance of the broader DQ-093 (prefers-reduced-motion gap). Even after DQ-093's blanket fix, consider whether this animation serves the user at all — a static green dot communicates "online" just as well.

## Evidence

- `frontend/lab-panels.css:3941` — `.md-pulse-dot { animation: md-pulse 1.2s ease-in-out infinite; }`
- `frontend/lab-panels.css:3944-3945` — keyframes with `transform: scale(0.8)`

## Fix

Replace infinite animation with a one-shot or remove entirely:
```css
.md-pulse-dot {
  /* Static green dot — no animation needed */
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--green);
}
```

If animation is desired, use `animation-iteration-count: 3` (pulse 3 times then stop).

## Files
- `frontend/lab-panels.css:3941-3945`
