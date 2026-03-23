---
id: DQ-072
priority: P1
category: typography
status: open
---

# DQ-072: font-size: 9px used 133 times — below type scale floor

## Problem
`font-size: 9px` appears **133 times** across 20 files. This is BELOW the design guide floor of 11px. At 9px, text is borderline illegible on many screens and fails accessibility contrast guidelines at normal weight.

Heaviest files:
- `league-intel.html`: 34 instances
- `lab-panels.css`: 31 instances
- `lab.html`: 25 instances
- `lab.js`: 15 instances

## Evidence
```
grep -c "font-size:\s*9px" results:
lab-panels.css: 31 | league-intel.html: 34 | lab.html: 25
lab.js: 15 | formulas.js: 3 | agents.html: 3
charts.js: 2 | styles.css: 2 | index.html: 2
+ 11 more files
```

## Fix
Replace all `font-size: 9px` with `font-size: 11px`. Where the element is uppercase with letter-spacing (common pattern for tiny labels), 11px uppercase will look visually similar. For truly cramped table cells, 12px mono is the right call.

## Scope
133 replacements across 20 files. Mechanical find-replace with spot checks on dense tables.
