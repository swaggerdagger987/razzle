# DQ-014: Hover shadow wrong size in lab.html

**Priority**: P2 — incorrect hover lift feel
**Category**: Box shadow / hover interaction

## Problem

DESIGN.md specifies hover lift as `6px 6px 0` + `translate(-2px, -2px)`. Two elements in `frontend/lab.html` use wrong hover shadow sizes:

## Locations

| Line | Selector | Current | Should be |
|------|----------|---------|-----------|
| 2147 | `.prospect-comp-card:hover` | `5px 5px 0` | `6px 6px 0` |
| 475 | `.btn-panel-action:hover` | `3px 3px 0` | `4px 4px 0` or `6px 6px 0` |

## Fix

- Line 2147: Change `box-shadow: 5px 5px 0 var(--ink)` → `box-shadow: 6px 6px 0 var(--ink)`
- Line 475: Change `box-shadow: 3px 3px 0 var(--ink)` → `box-shadow: 4px 4px 0 var(--ink)` (these are small action buttons, so lift from 2px→4px is proportional)

## Verification

Hover over prospect comparison cards and panel action buttons. The lift should feel consistent with other hoverable cards on the site.
