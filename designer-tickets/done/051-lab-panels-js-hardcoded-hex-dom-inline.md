# DES-051: lab-panels.js uses hardcoded hex accent colors in DOM inline styles

**Priority**: P2
**Area**: lab-panels.js (advantage bars, weekly score bars, position badges)
**Found by**: Design QA Cycle 5

## Problem

lab-panels.js applies accent colors as hardcoded hex values in inline `style="background:..."` on DOM elements, bypassing CSS variables. The design tokens (`var(--green)`, `var(--orange)`, `var(--pos-qb)`, etc.) exist but aren't used in JS-generated markup.

### Hardcoded accent hex in inline styles:
- Line 1134: `barColor = advantage >= 0 ? '#2ec4b6' : '#d97757'` → background on advantage bars
- Line 1994: `barColor = scores[j] >= p.season_avg ? '#2ec4b6' : '#d97757'` → weekly score bars
- Line 4072: Same pattern as 1994 — weekly bars in another panel
- Lines 1130, 1979, 3378, 3639, 3743, 4056, 4361: `POS_COLORS[pos]` hardcoded hex → background on position badges/dots

### Why this matters:
- CSS variables can be overridden by themes. Hardcoded hex can't.
- If accent colors ever change, these won't update.
- Creates maintenance burden — two sources of truth for the same colors.

## Fix

Replace hardcoded hex with CSS variable references in inline styles:
- `'#2ec4b6'` → `'var(--green)'`
- `'#d97757'` → `'var(--orange)'`
- `POS_COLORS` values → `'var(--pos-qb)'`, `'var(--pos-rb)'`, etc.

Note: Canvas drawing contexts (`ctx.fillStyle`) can't use CSS vars — only DOM inline styles should be updated. Canvas code correctly uses hex and is out of scope.
