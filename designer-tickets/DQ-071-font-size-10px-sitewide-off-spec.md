---
id: DQ-071
priority: P1
category: typography
status: open
---

# DQ-071: font-size: 10px used 325+ times — not in type scale

## Problem
DESIGN.md type scale allows: 32, 24, 20, 18, 16, 14, 13, 12, 11px. The value `10px` is NOT in the scale, yet it appears **325+ times** across 66+ files (125 in lab-panels.css, 43 in lab.html, 45 in league-intel.html, and ~112 across 63 standalone HTML pages).

Used for: position badges, team labels, table sub-headers, metadata text, stat footnotes.

## Evidence (grep counts)
- `lab-panels.css`: 125 instances
- `lab.html`: 43 instances
- `league-intel.html`: 45 instances
- 63 standalone HTML files: 1-5 instances each (~112 total)

## Fix
Replace all `font-size: 10px` with `font-size: 11px` (the nearest approved size). For truly tiny labels where 11px feels too large, use `font-size: 11px` anyway — the design guide chose 11px as the floor for a reason (readability).

## Scope
325+ replacements across 66+ files. High volume but mechanical find-replace.
