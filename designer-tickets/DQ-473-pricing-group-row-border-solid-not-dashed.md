---
id: DQ-473
title: pricing.html feature-matrix group-row uses solid border instead of dashed
priority: P3
category: visual-consistency
status: open
cycle: 60
---

## Problem

In the pricing comparison table, data row dividers use `2px dashed var(--ink-faint)` (line 138) but the group-row section headers use `2px solid var(--ink-faint)` (line 144). This creates an inconsistent divider style within the same table.

The design guide specifies dashed dividers inside cards: "2px dashed var(--ink-faint) inside cards."

## Evidence

`frontend/pricing.html`:
- Line 138: `.feature-matrix td { border-bottom: 2px dashed var(--ink-faint); }` (correct)
- Line 144: `.feature-matrix .group-row td { border-bottom: 2px solid var(--ink-faint); }` (should be dashed)

## Fix

Change line 144 from `solid` to `dashed`:

```css
.feature-matrix .group-row td { ... border-bottom: 2px dashed var(--ink-faint); }
```

## Files
- `frontend/pricing.html` line 144
