# DQ-015: Tiers page cream text uses hardcoded rgba, poor contrast on light tiers

**Priority**: P1 — text readability issue on tier labels
**Category**: Color token / dark mode

## Problem

`frontend/tiers.html` uses hardcoded `rgba(237,224,207,...)` (sand/cream color) for tier count and description text. This is the sand background color at partial opacity — it works as light text on dark accent backgrounds (S=red, A=orange) but has poor contrast on lighter tier backgrounds (B=yellow, F=ink-light).

## Locations

| Line | Selector | Current |
|------|----------|---------|
| 144 | `.tl-tier-count` | `color: rgba(237,224,207,0.8)` |
| 217 | `.tl-tier-desc` | `color: rgba(237,224,207,0.7)` |

## Problem Detail

- B tier (yellow `#ffc857`) + cream text at 80% = very low contrast
- F tier (ink-light `#8a7565`) + cream text at 70% = borderline
- These hardcoded values won't adapt to dark mode at all

## Fix

Replace with `var(--text-on-accent)` which is already defined in styles.css and handles both light and dark mode:
```css
.tl-tier-count { color: var(--text-on-accent); opacity: 0.8; }
.tl-tier-desc { color: var(--text-on-accent); opacity: 0.7; }
```

## Verification

Check the tier list page — B and F tier label text should be clearly readable. Toggle dark mode — text should adapt.
