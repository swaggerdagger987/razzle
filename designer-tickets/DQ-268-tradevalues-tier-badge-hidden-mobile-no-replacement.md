---
id: DQ-268
title: Trade values tier badge hidden on mobile (<480px) with no replacement indicator
priority: P2
category: mobile
status: open
cycle: 36
---

## Problem

The Dynasty Trade Value Chart page hides `.tv-tier-badge` at 480px breakpoint:

```css
.tv-tier-badge { display: none; }
```

This removes the tier label (Elite, Blue Chip, Premium, etc.) from every player row on mobile. No alternative indicator replaces it — users on phones lose ALL tier context. The tier is the primary organizational concept of the page.

## Evidence

`frontend/tradevalues.html` line ~394:
```css
@media (max-width: 480px) {
  .tv-tier-badge { display: none; }
}
```

No replacement element, no tooltip, no color-coded indicator takes its place.

## Fix

Instead of hiding the badge entirely, use a compact version:

**Option A:** Show just the tier number as a small colored dot or 1-char badge (E, B, P, S, etc.)
**Option B:** Apply the tier color as a left border on the row (3px solid tier-color) so tier grouping is still visible
**Option C:** Keep the badge but shrink it: `font-size: 9px; padding: 1px 4px;`

Option B is cheapest — 4 lines of CSS, zero HTML changes.

## Files
- `frontend/tradevalues.html` — mobile media query, line ~394

## Impact
Trade values is one of the most-shared pages. Mobile users (majority of Reddit traffic) can't tell which tier a player belongs to.
