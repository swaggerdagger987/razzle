---
id: S3-053
severity: S3
confidence: HIGH
category: design
source: DQ-025,DQ-065,DQ-195,DQ-196,DQ-197,DQ-280,DQ-282,DQ-284,DQ-287,DQ-288
status: OPEN
---

# Sitewide off-token border-radius values (3px/4px/6px) — batch cleanup

## Root Cause

DESIGN.md defines three radius tokens: `--radius-sm` (8px), `--radius` (12px), `--radius-lg` (20px). Multiple files use off-token values below the 8px minimum:

- 3px border-radius in lab-panels.js, warroom.js (DQ-006, DQ-282)
- 4px border-radius in formulas.js, charts.js (DQ-065, DQ-197)
- 6px border-radius in lab.html, lab-panels.css, league-intel.html (DQ-013, DQ-284, DQ-288)
- 2px border-radius in styles.css search highlight (DQ-287)

## Fix

Replace all sub-8px border-radius values with token equivalents:
- 2px-4px → `var(--radius-sm)` (8px) for small badges/chips
- 6px → `var(--radius-sm)` (8px)
- Or keep intentionally small (2px for input underlines) with a `/* intentional */` comment

## Files

- `frontend/lab-panels.js` — multiple instances
- `frontend/lab-panels.css` — 6 values
- `frontend/lab.html` — 2 instances
- `frontend/formulas.js` — 1 instance
- `frontend/warroom.js` — leader cloud badge
- `frontend/league-intel.html` — pressure bar fill
- `frontend/styles.css` — search highlight, tag picker

## Acceptance Criteria

- All border-radius values use design tokens or have intentional exceptions documented
