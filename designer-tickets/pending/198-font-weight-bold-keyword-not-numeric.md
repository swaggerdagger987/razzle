# DES-198: font-weight: bold keyword instead of numeric (700) — 23 instances

**Priority**: P3
**Category**: Design System Consistency
**Affects**: lab-panels.css (4), lab.html (8), lab.js (8), lab-panels.js (3)
**Cycle**: 19

## Problem

DESIGN.md type scale specifies numeric font weights (400, 500, 600, 700). The keyword `bold` is imprecise — it resolves to 700 but doesn't match the design system's explicit numeric convention. 23 instances use `font-weight: bold` instead of `font-weight: 700`.

The 1 instance in `app.js:1710` is a console.log easter egg and can be excluded.

## Evidence

`lab-panels.css:4824`:
```css
.gs-name { font-weight: bold; }
```

`lab-panels.css:4858`:
```css
.gs-diff-badge { font-weight: bold; }
```

`lab.html:2937` (Trade Analyzer style block):
```css
font-weight: bold;
```

`lab.js:9199` (inline style):
```javascript
html += '<span style="... font-weight:bold; ...">'
```

## Fix

Find-and-replace `font-weight: bold` → `font-weight: 700` in all 23 instances (skip the console.log in app.js). No visual change — purely design system governance.

## Why it matters

Design system consistency. When every other weight uses numeric values, `bold` is the odd one out. Makes grep-based auditing harder ("how many 700s do we have?" misses bold). Low urgency but trivial fix.
