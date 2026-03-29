---
id: S2-027
severity: S2
category: ux
title: Lab toolbar is visually complex — search, filters, tools, undo, settings, export all visible
source: deep-audit
status: open
---

## Problem

The Lab toolbar includes: search box, result count, add filter button, filter chips, tools dropdown, undo/redo, settings panel toggle, export buttons, and display mode chips. While each is useful, the combined density is overwhelming. Display toggles were moved to Settings panel (Phase ship loop T-3), but export actions remain ungrouped.

## Root Cause

**`frontend/lab.html:3335-3433`** — `<div class="toolbar" id="mainToolbar">` contains all controls:
- Position chips (QB/RB/WR/TE/ALL): lines 3337-3343
- Search box: line 3347
- Season/Week/Preset selects: lines 3351-3357
- Columns/Formulas/Filter buttons: lines 3361-3365
- Undo/Redo buttons: lines 3370-3371
- Tools dropdown (VIEW, EXPORT, DISPLAY, ANALYSIS sections): lines 3373-3432

All controls compete for horizontal space in a single toolbar row at desktop widths.

## Fix

Consider grouping export actions (CSV, PNG, Share) into a single "Export" dropdown button to reduce toolbar clutter. The toolbar should prioritize search and filter controls.

## Accept When

- The toolbar has visually distinct groups (search | filters | actions)
- Export actions are consolidated into fewer visible buttons
