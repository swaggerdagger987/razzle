# S2-008: 15+ JS-generated 1px borders — minimum should be 2px

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-TICKETS.md #4
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md says minimum border width is 2px (cards=3px, chips/badges=2px, dashed dividers=2px). 15 instances of `1px solid` in JS-generated styles create thin hairline borders:

- `frontend/charts.js` — 8 instances (table cell borders in chart overlays)
- `frontend/lab.js` — 4 instances (table row borders, list items)
- `frontend/player.js:749` — 1 instance (search result divider)
- `frontend/formulas.js:140` — 1 instance (formula list divider)
- `frontend/lab-panels.js:10205` — 1 instance (table row border)
- `frontend/agents.html:2272` — 1 instance of `1px dashed`

## Fix

Replace all `1px solid` with `2px solid` in JS border assignments.
Replace `1px dashed` with `2px dashed`.

## Files to Change

- `frontend/charts.js` — 8 occurrences
- `frontend/lab.js` — 4 occurrences
- `frontend/player.js:749`
- `frontend/formulas.js:140`
- `frontend/lab-panels.js:10205`
- `frontend/agents.html:2272`

## Accept When

Zero instances of `1px solid` or `1px dashed` in JS-generated DOM styles. Grep for `"1px solid"` and `"1px dashed"` in .js and .html files.
