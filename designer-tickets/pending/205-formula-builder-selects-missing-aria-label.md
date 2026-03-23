# DES-205: Formula builder <select> elements missing aria-label

**Priority**: P2
**Category**: Accessibility
**Affects**: formulas.js — Formula Builder (core Lab feature)
**Cycle**: 19

## Problem

The formula builder dynamically creates `<select>` elements for stat selection, operator selection, and weight input without `<label>` elements, `aria-label`, or `aria-labelledby` attributes. Screen readers announce these as unlabeled select/input controls — users hear "combo box" with no indication of what they're selecting.

## Evidence

`formulas.js:28-34`:
```javascript
row.innerHTML = `
  <select class="select-chunky formula-stat" style="flex:2">${statOptions}</select>
  <select class="select-chunky formula-op" style="flex:1">
    <option value="*">×</option>
    <option value="+">+</option>
    <option value="-">−</option>
  </select>
  <input type="number" class="input-chunky formula-weight" value="1" step="0.1" style="flex:1; min-width:60px">
  <span style="cursor:pointer; ..." onclick="this.parentElement.remove()">×</span>
`;
```

Three controls, zero accessible names:
1. `<select class="formula-stat">` — no label. Should be "Stat" or "Metric"
2. `<select class="formula-op">` — no label. Should be "Operator"
3. `<input class="formula-weight">` — no label. Should be "Weight"

Compare with auth modal inputs which correctly use `aria-label` (verified in cycle 16).

## Fix

Add `aria-label` to each dynamically created control:
```javascript
<select class="select-chunky formula-stat" aria-label="Stat metric" style="flex:2">
<select class="select-chunky formula-op" aria-label="Operator" style="flex:1">
<input type="number" class="input-chunky formula-weight" aria-label="Weight" value="1" step="0.1" style="flex:1; min-width:60px">
```

## Why it matters

The formula builder is a flagship differentiator — "custom formulas" are prominently featured in marketing copy and the pricing page. A screen reader user who reaches the formula builder gets three unlabeled controls in a row. This is a WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) violation on a core feature.
