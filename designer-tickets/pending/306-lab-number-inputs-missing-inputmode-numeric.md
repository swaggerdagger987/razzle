# DES-306: Lab number inputs missing inputmode="numeric" for mobile keyboards

**Priority**: P2
**Category**: Mobile UX
**Pages**: lab.html
**Lines**: 3438, 3532

## Problem

The Lab has 2 `type="number"` inputs:
- Min GP filter (`#minGPInput`, line 3438)
- Filter value (`#filterValue`, line 3532)

On mobile browsers, `type="number"` shows a keyboard with limited features (no decimal on some browsers, awkward layout). `inputmode="numeric"` gives a clean numeric pad optimized for mobile entry.

Additionally, neither input has `inputmode="decimal"` or `inputmode="numeric"`. The filterValue input especially needs `inputmode="decimal"` since stat filters may use decimal values (e.g., PPG >= 15.5).

## Current

```html
<input type="number" class="input-chunky filter-input-sm" id="minGPInput" placeholder="Min GP" min="1" max="17">
<input type="number" class="input-chunky" id="filterValue" placeholder="0" style="flex:1">
```

## Expected

```html
<input type="number" inputmode="numeric" class="input-chunky filter-input-sm" id="minGPInput" placeholder="Min GP" min="1" max="17">
<input type="number" inputmode="decimal" class="input-chunky" id="filterValue" placeholder="0" style="flex:1">
```

## Fix

Add `inputmode="numeric"` to minGPInput (integer values only). Add `inputmode="decimal"` to filterValue (may need decimals). 2 attribute additions. Zero instances of `inputmode` exist anywhere in the frontend currently.
