---
id: DQ-457
priority: P2
category: design-token
status: open
cycle: 58
---

# DQ-457: Soft drop-shadows (0 4px 8px rgba) used instead of hard offset shadows

## Problem

DESIGN.md specifies only hard offset shadows: `4px 4px 0 var(--ink)` for cards, `2px 2px 0` for badges. The "0 blur" is intentional — the chunky comic-strip aesthetic requires crisp edges, not soft depth.

Several elements use soft CSS drop-shadows (`box-shadow: 0 Npx Npx rgba(...)`) which create a material-design/fintech feel that contradicts the brand.

## Evidence

### lab.html
- Line ~1037: `box-shadow: 0 4px 8px rgba(45,31,20,0.08);` — column stats popover
- Line ~1040: `box-shadow: 0 4px 8px rgba(0,0,0,0.25);` — dark mode popover (also cold black)
- Line ~596: `box-shadow: -8px 0 24px rgba(45,31,20,0.15);` — bulk action bar soft glow

### lab-panels.css
- Line ~2308: Similar soft shadow patterns on detail popovers

### agents.html
- Multiple soft shadows on agent cards and scenario panels (inline styles)

## Fix

Replace all soft shadows with hard offset shadows:
```css
/* Before (soft/fintech) */
box-shadow: 0 4px 8px rgba(45,31,20,0.08);

/* After (chunky/comic-strip) */
box-shadow: 4px 4px 0 var(--ink);
```

For overlays/popovers that need depth separation, use:
```css
box-shadow: 4px 4px 0 var(--ink);
```

The only place soft shadows are acceptable is the sticky header blur effect (functional, not decorative).

## Why It Matters

DESIGN.md: "Not this: every dark-mode fintech/AI dashboard." Soft drop-shadows are the #1 visual cue of fintech dashboards. Hard offset shadows are the #1 visual cue of comic-strip design. Mixing them breaks the brand.

## Verification

Search for `box-shadow:.*rgba` with non-zero blur values. Only sticky header blur effects should remain.
