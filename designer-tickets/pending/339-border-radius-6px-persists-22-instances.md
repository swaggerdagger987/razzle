# DQ-339: border-radius: 6px persists — 22 instances across 15 files

**Priority**: P3
**Category**: Design System — Border Radius
**Files**: auction.html, breakouts.html, buysell.html, lab-panels.css (4), lab-panels.js (4), lab.js (1), league-intel.html, lab.html (2), percentiles.html, pace.html, prospects.html, rosterbuilder.html, scarcity.html, tradevalues.html, tradefinder.html

## Problem

DESIGN.md border radius tokens: 8px (--radius-sm), 12px (--radius), 20px (--radius-lg). No 6px allowed. DQ-057 and DQ-058 were marked DONE but 22 instances of `border-radius: 6px` persist across 15 files. Likely missed during the original fix or introduced in later phases.

Most are on progress bars, bar fills, and small data containers — elements where 6px was likely chosen for "slightly rounded" but should be 8px per the design system.

## Fix

Replace all `border-radius: 6px` with `border-radius: 8px` (or `var(--radius-sm)` where CSS vars work).

For JS files (lab-panels.js, lab.js), use `var(--radius-sm)` in template strings.

Grep command: `rg "border-radius:\s*6px" frontend/`

Special case: `percentiles.html:213` has `border-radius: 6px 0 0 4px` — fix to `8px 0 0 8px`.
