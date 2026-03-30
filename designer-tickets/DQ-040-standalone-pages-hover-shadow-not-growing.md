# DQ-040: Standalone page cards hover shadow stays at 4px instead of growing to 6px

**Priority**: P2 — design spec violation
**Pages**: breakouts.html, dashboard.html, tiers.html (and likely others)
**Category**: Interactive states / hover lift

## Problem

DESIGN.md specifies the hover lift pattern:
- **At rest**: `box-shadow: 4px 4px 0 var(--ink)`
- **On hover**: `box-shadow: 6px 6px 0 var(--ink)` + `transform: translate(-2px, -2px)`

Several standalone pages implement the translate but keep the shadow at 4px on hover, so the card slides up-left but doesn't visually "lift" off the surface. The shadow must grow from 4px to 6px to complete the lift illusion.

## Evidence

**breakouts.html** (lines 125-128):
```css
.breakout-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);  /* Should be 6px 6px 0 */
}
```

**dashboard.html**: `.db-export-btn:hover` changes background but shadow stays at `4px 4px 0` (line 284-286)

**tiers.html**: Only hover effect is `.tl-pos-tab:hover { transform: translateY(-1px); }` — no shadow change at all

**Compare**: pricing.html correctly uses `6px 6px 0` on hover (line 90). These standalone pages should match.

## Fix

For each affected page, update the hover rule to grow the shadow:
```css
.breakout-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
```
Apply the same pattern to dashboard cards and tiers position tabs.
