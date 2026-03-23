# DES-325: lab-panels.js — 3 instances of inline border-radius:3px

**Priority**: P2
**Area**: lab-panels.js (lines 9579, 9580, 9646)
**Cycle**: 30

## Problem

Three inline style declarations in lab-panels.js use `border-radius:3px` — well below the DESIGN.md minimum of 8px (`--radius-sm`).

### Locations:

**Line 9579** — progress bar track:
```javascript
style="... border-radius:3px; ..."
```

**Line 9580** — progress bar fill:
```javascript
style="... border-radius:3px; ..."
```

**Line 9646** — position badge:
```javascript
style="... border-radius:3px; ..."
```

These are in JS-generated DOM elements that bypass the CSS design system. DES-057 fixed 27 similar instances in lab.js. DES-058 fixed ~300 in standalone pages. These 3 in lab-panels.js were missed.

## Fix

Replace `border-radius:3px` with `border-radius:var(--radius-sm)` (8px) in all 3 locations.

For the progress bar elements, if 8px looks too round for thin bars, use `border-radius:4px` as an intentional exception and add a code comment noting the deviation.

## Why This Matters

These inline styles are invisible to CSS audits — they only show up in JS source review. They create visual inconsistency when the same panel type renders some elements with 3px corners and others with 8px.
