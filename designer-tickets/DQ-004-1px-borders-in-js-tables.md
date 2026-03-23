# DQ-004: 15 instances of 1px borders in JS-rendered tables/lists

**Priority**: P2 — visible in Lab data views
**Category**: Border weight
**Files**: `frontend/charts.js` (8), `frontend/lab.js` (4), `frontend/formulas.js` (1), `frontend/player.js` (1), `frontend/lab-panels.js` (1)

## Problem

DESIGN.md says "NO thin 1px borders" and specifies "Dashed dividers: 2px dashed `var(--ink-faint)` inside cards."

15 inline styles in JS use `border-bottom:1px solid var(--ink-faint)` for table row dividers. These are visible in:
- Compare table rows (charts.js:904,908)
- Stat breakdown tables (charts.js:1270-1316)
- Formula list dividers (formulas.js:134)
- Player search results (player.js:753)
- Weekly breakdown rows (lab.js:2397,2413)
- Trade analyzer autocomplete (lab.js:9246)
- Draft pick rows (lab.js:10773)
- Power rankings table (lab-panels.js:10196)

## Fix

Replace all `border-bottom:1px solid var(--ink-faint)` with `border-bottom:2px dashed var(--ink-faint)` in these inline styles.

## Verification

Open the Lab, expand a player row, check compare tables, formula list — dividers should be dashed and 2px, not hair-thin solid lines.
