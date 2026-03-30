---
id: DQ-270
title: Logo mark rotation (-2deg) snaps on interaction — no transition property
priority: P3
category: polish
status: open
cycle: 36
---

## Problem

The `.logo-mark` element in the nav starts with `transform: rotate(-2deg)` but has no `transition` property and no explicit hover state. When the logo is interacted with (hover, focus, click), any browser-triggered reflow or state change causes the rotation to snap abruptly instead of smoothly easing.

Same pattern exists for tier badges in `lab-panels.css` — `.rankings-tier-badge` has `rotate(-2deg)` with no transition.

Per DESIGN.md, tier stickers should be "slightly rotated (rotate(3deg)) — slapped on, not placed." The rotation is correct, but it should stay stable on interaction, not snap.

## Evidence

`frontend/styles.css` line ~186:
```css
.logo-mark { transform: rotate(-2deg); /* no transition */ }
```

`frontend/lab-panels.css` tier badges:
```css
.rankings-tier-badge { transform: rotate(-2deg); /* no transition */ }
```

Neither has a `:hover` rule to preserve the rotation.

## Fix

Add transition and preserve rotation on hover:
```css
.logo-mark {
  transform: rotate(-2deg);
  transition: transform 0.15s ease;
}
.logo-mark:hover {
  transform: rotate(-2deg) scale(1.05); /* subtle lift, rotation preserved */
}
```

Same for tier badges — add explicit hover state that preserves rotation.

## Files
- `frontend/styles.css` — .logo-mark (line ~186)
- `frontend/lab-panels.css` — .rankings-tier-badge

## Impact
Subtle interaction jank on a high-visibility element. 4-line fix.
