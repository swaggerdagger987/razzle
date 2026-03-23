# DES-197: font-size: 9px below DESIGN.md type scale minimum (11px) — 141 instances

**Priority**: P2
**Category**: Type Scale / Accessibility
**Affects**: 26 files — lab.js (15), league-intel.html (34), lab.html (25), lab-panels.css (31), and 22 others
**Cycle**: 19

## Problem

DESIGN.md type scale defines the smallest size as 11px (uppercase section labels). 9px is not on the scale and sits below the minimum. There are 141 instances of `font-size: 9px` across 26 files. At 9px, text is difficult to read on standard displays and nearly illegible on mobile — especially for position badges, stat labels, and separators that users need to parse during analysis.

## Evidence

Top offenders:
- `league-intel.html`: 34 instances (position badges, stat labels, trade chips)
- `lab-panels.css`: 31 instances (panel badges, data labels, metric chips)
- `lab.html`: 25 instances (trade analyzer, column badges, formula labels)
- `lab.js`: 15 instances (position badges in trade picker, roster builder labels)

Example from `lab.js:9199`:
```javascript
html += '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; ...">'
```

Example from `lab.js:11683`:
```javascript
html += '<div style="font-family:var(--font-mono); font-size:9px; color:var(--ink-light); text-transform:uppercase; ...">'
```

## Fix

Replace all 9px instances with the nearest type scale value:
- Position badges (9px → 11px) — these are uppercase text, matching the 11px spec
- Data labels and separators (9px → 11px or 12px depending on context)
- Stat chips (9px → 12px) — matching the "Badges, chips, small data" spec

## Why it matters

9px text fails WCAG SC 1.4.4 (Resize Text) expectations — users shouldn't need to zoom to read position badges and stat labels. These badges appear on every panel page, the trade analyzer, and the roster builder. Power users on r/DynastyFF take screenshots of these views — illegible text undermines the "polished tool" impression.
