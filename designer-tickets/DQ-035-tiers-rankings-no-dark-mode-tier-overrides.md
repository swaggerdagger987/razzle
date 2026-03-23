# DQ-035: Tiers/Rankings pages missing dark mode overrides for tier colors

**Priority**: P2 — dark mode gap
**Pages**: tiers.html, rankings.html
**Category**: Dark mode

## Problem

Neither page has `[data-theme="dark"]` CSS rules for tier section backgrounds or tier badge colors. The accent colors (red, orange, yellow, green, teal, blue) render at full vibrancy on the dark espresso background, which is visually harsh. These bright accent backgrounds need muting for dark mode.

## Evidence

**tiers.html** (lines 149-154):
```css
.tl-tier-label.S { background: var(--red); }
.tl-tier-label.A { background: var(--orange); }
.tl-tier-label.B { background: var(--yellow); }
/* No [data-theme="dark"] overrides anywhere */
```

**rankings.html** (lines 133-140):
```css
.tier-1 .rankings-tier-badge { background: var(--orange); }
.tier-2 .rankings-tier-badge { background: var(--blue); }
/* No [data-theme="dark"] overrides anywhere */
```

- Screenshot of tiers dark mode confirms: bright yellow B-tier and bright teal C-tier labels are visually jarring against dark brown

## Fix

Add dark mode rules that use muted versions of the accent colors:
```css
[data-theme="dark"] .tl-tier-label.S { background: var(--red); opacity: 0.85; }
[data-theme="dark"] .tl-tier-label.B { background: var(--yellow); color: var(--bg-ink); }
```
Or use the light-tint dark-mode variants (e.g., `var(--orange-light)` which flips to `#5c3325` in dark mode).
