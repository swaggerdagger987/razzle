# S2-009: Off-brand hardcoded hex colors — replace with design tokens

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-TICKETS.md #5
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Several hardcoded hex colors don't match any design token:

**Near-miss espresso colors** (3 files):
- `agents.html:1604,1607` — `#6b5a4e` and `#a89585`
- `lab.html:3155,3158` — same
- `league-intel.html:2535,2538` — same
- Should be `var(--ink-medium)` (#5c4a3d) and `var(--ink-light)` (#8a7565)

**Tailwind red** (not Razzle red `#e63946`):
- `agents.html:2157` — `#e74c3c` urgency fallback
- `lab-panels.js:6356` — `#e74c3c` TD component color
- `lab-panels.js:6702` — `#e74c3c` comparison color

**Tailwind yellow/green/pink** in comparison palette:
- `lab-panels.js:6702` — `#eab308`, `#16a34a`, `#f472b6`

## Fix

- `#6b5a4e` → `var(--ink-medium)` / `getComputedStyle` equivalent
- `#a89585` → `var(--ink-light)`
- `#e74c3c` → `var(--red)` or `#e63946`
- `#eab308` → `var(--yellow)` or `#ffc857`
- `#16a34a` → `var(--green)` or `#2ec4b6`
- `#f472b6` → `var(--orange)` or `#d97757`

## Files to Change

- `frontend/agents.html:1604,1607,2157`
- `frontend/lab.html:3155,3158`
- `frontend/league-intel.html:2535,2538`
- `frontend/lab-panels.js:6356,6702`

## Accept When

Zero instances of `#e74c3c`, `#eab308`, `#16a34a`, `#f472b6`, `#6b5a4e`, `#a89585` in frontend files.
