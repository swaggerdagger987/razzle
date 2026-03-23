# DES-298: Lab filter modal selects missing aria-label

**Priority**: P2
**Category**: Accessibility
**Page**: lab.html
**Lines**: 3524-3531

## Problem

The "Add Filter" modal has two `<select>` elements (`#filterStat` and `#filterOp`) and one `<input>` (`#filterValue`) with no visible labels and no `aria-label`. Screen reader users hear "combobox" with zero context about what to select.

**Note**: DES-222 covers lab-panels.js search inputs. DES-205 covers formula builder selects. These are the MAIN screener filter controls in the filter modal — different elements.

## Current

```html
<select class="select-chunky" id="filterStat" style="flex:2"></select>
<select class="select-chunky" id="filterOp" style="flex:1">
<input type="number" class="input-chunky" id="filterValue" placeholder="0" style="flex:1">
```

## Expected

```html
<select class="select-chunky" id="filterStat" style="flex:2" aria-label="Filter statistic"></select>
<select class="select-chunky" id="filterOp" style="flex:1" aria-label="Filter operator">
<input type="number" class="input-chunky" id="filterValue" placeholder="0" style="flex:1" aria-label="Filter value">
```

## Fix

Add `aria-label` to all 3 form controls in the filter modal. 3 attribute additions, zero visual change.
