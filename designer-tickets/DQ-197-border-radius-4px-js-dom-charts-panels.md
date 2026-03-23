---
id: DQ-197
priority: P3
category: border-radius
status: open
---

# DQ-197: border-radius:4px on JS-created badges in charts.js and lab-panels.js — off-token

## Problem

DQ-065 fixed `formulas.js:273` but missed these 4 instances of `border-radius:4px` in other JS files:

| File | Line | Element |
|------|------|---------|
| `charts.js` | 891 | Position badge in scatter plot tooltip |
| `charts.js` | 1259 | Position badge in prospect chart tooltip |
| `lab-panels.js` | 9655 | Verdict label badge (e.g., "SMASH", "BUY") |
| `lab-panels.js` | 10407 | Histogram bar in Power Rankings |

Also `formulas.js:132` has a "Published" badge with `border-radius:4px` that was not covered by DQ-065 (which only covers line 273).

## Fix

Replace `border-radius:4px` with `border-radius:var(--radius-sm)` on all 5 instances:

```
charts.js:891       border-radius:4px → border-radius:var(--radius-sm)
charts.js:1259      border-radius:4px → border-radius:var(--radius-sm)
lab-panels.js:9655  border-radius:4px → border-radius:var(--radius-sm)
lab-panels.js:10407 border-radius:4px → border-radius:var(--radius-sm)
formulas.js:132     border-radius:4px → border-radius:var(--radius-sm)
```

## Scope

5 edits across 3 files.
