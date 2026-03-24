# DQ-345: seasonpace.html milestone badge dark mode contrast issue

**Priority**: P3
**Category**: Dark Mode — Standalone Page
**File**: frontend/seasonpace.html, lines 54-55

## Problem

Silver milestone badges use:
```css
.sp-milestone-silver { background: var(--blue-light); color: var(--blue); border-color: var(--blue); }
```

In dark mode per DESIGN.md Espresso Flip:
- `--blue-light` → `#1e2840` (very dark blue)
- `--blue` → `#5b7fff` (unchanged)

This creates bright blue text on an almost-black background. While technically readable (high contrast), the dark background blends with the page background (`--bg` = `#2d1f14` in dark mode), making the badge nearly invisible as a distinct element.

Gold milestone has the same pattern but with yellow which has better contrast.

## Fix

Add dark mode override:
```css
[data-theme="dark"] .sp-milestone-silver {
  background: var(--blue);
  color: var(--bg);
  border-color: var(--blue);
}
```

This flips the badge to bright blue background with dark text — matching the dark mode pattern used for position badges elsewhere.
