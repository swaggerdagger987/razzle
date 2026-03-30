# DES-047: lab-panels.css has 171 sub-minimum border-radius instances

**Priority**: P1
**Area**: lab-panels.css (all Lab panels)
**Found by**: Design QA Cycle 5

## Problem

lab-panels.css has **171 instances** of `border-radius` values below the `--radius-sm` (8px) design minimum. Values include 2px, 3px, 4px, 5px, and 6px across position badges, bar fills, grade badges, tier badges, advantage chips, and table elements.

This is the single largest CSS token governance gap in the codebase. DES-041 fixed 7 instances in styles.css. lab-panels.css has 24x more.

## Examples

- `.tv-pos-badge` — border-radius: 5px (should be 8px)
- `.vorp-pos-badge` — border-radius: 5px
- `.pa-avg-chip` — border-radius: 4px
- `.tv-bar-fill` — border-radius: 4px (inner fill bars are OK at smaller radius)
- Various `.lp-grade-badge` — border-radius: 6px

## Conversion impact

The Lab is the growth engine. Every panel is a potential screenshot. Inconsistent border-radius makes the product feel unfinished.

## Fix

1. Grep `border-radius: [2-6]px` in lab-panels.css
2. Replace badge/chip/tag radius with `var(--radius-sm)` (8px)
3. Exception: inner bar fills (e.g., progress bar inside a track) can stay at their current radius since they follow the parent track's shape
4. Exception: `border-radius: 50%` circles are fine

## Scope

~171 replacements in lab-panels.css, minus exceptions for bar fills and circles.
