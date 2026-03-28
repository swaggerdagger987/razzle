# S2-057: font-size 10px (325+ instances) and 9px (133 instances) not in type scale

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-071, DQ-072
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

DESIGN.md defines a type scale: 11px, 12px, 14px, 16px, 20px, 24px, 32px, 48px. However, 10px is used 325+ times across 66+ files, and 9px is used 133 times across 20 files. These are below the floor of the type scale.

**10px hotspots** (DQ-071):
- `frontend/lab-panels.css` — 125 instances
- `frontend/lab.html` — 43 instances
- `frontend/league-intel.html` — 45 instances

**9px hotspots** (DQ-072):
- `frontend/lab-panels.css` — 31 instances
- `frontend/league-intel.html` — 34 instances
- `frontend/lab.html` — 25 instances
- `frontend/lab.js` — 15 instances (canvas font sizes)

## Impact

- Sub-11px text is hard to read on low-DPI screens
- Inconsistent sizing creates visual noise
- 9px canvas text especially poor on non-retina displays
- WCAG: no minimum font size requirement, but usability suffers below 10px

## Fix

Audit all 458 instances. For each:
1. If it's a data label in a tight space: use 11px (type scale floor)
2. If it's supplementary metadata: consider hiding instead of shrinking
3. If it's canvas text: 11px minimum, scaled by device pixel ratio

This is a large refactor — consider doing it file-by-file:
1. lab-panels.css first (156 instances)
2. lab.html (68 instances)
3. league-intel.html (79 instances)
4. lab.js canvas calls (15 instances)

## Files to Change

- `frontend/lab-panels.css`, `frontend/lab.html`, `frontend/league-intel.html`, `frontend/lab.js` (primary)
- 60+ other files (secondary)

## Accept When

1. No font-size below 11px in CSS or canvas code
2. All text readable on standard (non-retina) screens
3. Layout doesn't break from size increases (some tables may need wider columns)
