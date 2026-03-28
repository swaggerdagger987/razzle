# S3-040: Border-radius 3px/4px/6px values not in design token set

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-006, DQ-013
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md defines three radius tokens: `--radius-sm` (8px), `--radius` (12px), `--radius-lg` (20px). Several JS-generated elements and lab.html use 3px, 4px, and 6px border-radius values that fall below the smallest token.

**Locations (border-radius: 3px)**:
- `frontend/lab-panels.js:9591` — progress bar inner fill
- `frontend/lab-panels.js:9592` — progress bar inner fill
- `frontend/lab-panels.js:9658` — position badge in table
- `frontend/warroom.js:3113` — LEADER badge
- `frontend/warroom.js:3615` — cloud-synced badge

**Locations (border-radius: 4px)**:
- `frontend/charts.js:891` — position badge in chart overlay
- `frontend/charts.js:1259` — position badge in chart overlay
- `frontend/formulas.js:138` — Published badge
- `frontend/formulas.js:279` — formula type badge
- `frontend/lab-panels.js:9667` — verdict badge
- `frontend/lab-panels.js:10419` — histogram bar top corners

**Locations (border-radius: 6px)**:
- `frontend/lab.html:2246` — already uses `var(--radius-sm)` ✓ (false positive)
- `frontend/lab-panels.js:9589` — stat card container
- `frontend/lab-panels.js:9612` — stat card with left border
- `frontend/lab-panels.js:10015` — power rankings canvas
- `frontend/lab-panels.js:10188` — grade badge container
- `frontend/lab.js:9297` — position breakdown bar

## Fix

- **3px → 4px** for small inline badges (progress bars, position pills). 4px is the practical minimum for chunky aesthetic.
- **4px → `var(--radius-sm)` (8px)** for badges that are standalone elements (Published, verdict)
- **6px → `var(--radius-sm)` (8px)** for card-like containers

Note: Progress bar inner fills (3px) can stay at 3-4px since they're inside a container with proper radius. Focus on visible standalone elements.

## Files to Change

- `frontend/lab-panels.js:9589,9612,9658,9667,10015,10188` — 6 radius updates
- `frontend/charts.js:891,1259` — 2 radius updates
- `frontend/formulas.js:138,279` — 2 radius updates
- `frontend/lab.js:9297` — 1 radius update
- `frontend/warroom.js:3113,3615` — 2 radius updates

## Accept When

1. No border-radius values between 1-7px on standalone visible elements
2. Small inline badges use minimum 4px
3. Card containers use `var(--radius-sm)` or 8px
4. Visual check: badges and cards feel consistent with design system

## Do NOT Touch

- Progress bar inner fills where radius matches parent container
- CSS files — this ticket covers JS-generated elements only
- `lab.html:2246` — already correct with `var(--radius-sm)`
