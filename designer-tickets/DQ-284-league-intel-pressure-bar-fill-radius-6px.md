---
id: DQ-284
priority: P3
category: border-radius
status: open
---

# DQ-284: league-intel.html pressure-bar-fill uses border-radius:6px (off-token)

## Problem

DESIGN.md border radius tokens: 8px, 12px, 20px. No 6px token exists.

The pressure map's progress bar fill element uses `border-radius: 6px`:

```css
.pressure-bar-fill {
  height: 100%;
  border-radius: 6px;    /* OFF-TOKEN */
  transition: width 0.4s ease;
}
```

The parent `.pressure-bar` correctly uses `border-radius: var(--radius-sm)` (8px). The inner fill should match or use a slightly smaller value, but 6px is not a design token.

## Where

`frontend/league-intel.html:451`

## Fix

Change `border-radius: 6px` to `border-radius: var(--radius-sm)` (8px) to match the parent track.

Inner fills inside rounded containers can use matching radius -- CSS handles the containment via `overflow: hidden` on the parent.

## Not a dupe of

DQ-048 (done) fixed league-intel sub-minimum radius values -- this specific instance was missed or regressed.
