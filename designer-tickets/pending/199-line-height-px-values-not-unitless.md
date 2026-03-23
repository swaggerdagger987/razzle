# DES-199: line-height uses pixel values instead of unitless — 7 instances

**Priority**: P3
**Category**: Accessibility / Responsive
**Affects**: lab-panels.css (2), lab.html (2), styles.css (1), tradevalues.html (1), league-intel.html (1)
**Cycle**: 19

## Problem

Seven instances use pixel-based line-height values (14px, 18px, 26px, 30px) instead of unitless multipliers. Pixel line-heights don't scale with user font-size preferences or browser zoom. When a user increases their default font size (common accessibility setting), the text grows but the line-height stays fixed, causing overlapping lines.

## Evidence

`lab-panels.css:574`: `line-height: 26px;`
`lab-panels.css:4638`: `line-height: 18px;`
`lab.html:1668`: `line-height: 14px;`
`lab.html:1720`: `line-height: 30px;`
`styles.css:1387`: `line-height: 14px;`
`tradevalues.html:176`: `line-height: 26px;`
`league-intel.html:7400`: pixel line-height in inline style

## Fix

Convert to unitless multipliers:
- `14px` → `1.1` (assuming ~13px font-size context)
- `18px` → `1.3` (assuming ~14px font-size context)
- `26px` → `1.6` (assuming ~16px font-size context)
- `30px` → `1.5` (assuming ~20px font-size context)

Exact values depend on the element's font-size — check each context.

## Why it matters

WCAG SC 1.4.12 (Text Spacing) recommends scalable text properties. Dynasty power users who increase browser font size (common on large monitors) will see text collisions in these specific components. Small scope, easy fix.
