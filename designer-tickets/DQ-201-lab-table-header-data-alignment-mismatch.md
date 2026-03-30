---
id: DQ-201
priority: P2
category: layout / data readability
status: open
---

# Lab screener numeric column headers center-aligned but data cells left-aligned

## Problem

In the Lab screener table, column headers for numeric stat columns use `text-align:center` but the corresponding data cells default to `text-align:left` (browser `<td>` default). This creates a visual misalignment — headers float to the center while numbers hug the left edge below them.

## Evidence

**Headers** (lab.js line 1598):
```javascript
html += `<th ... style="${cwStyle || 'width:80px;'} text-align:center;">${col.label}...`
```

**Data cells** — no explicit text-align set:
```javascript
html += `<td${scAttr}${hStyle}>${ldrDot}${formatStat(val, col.decimals)}</td>`;
```

The utility columns (star, checkbox, pin, rank) are correctly center-aligned in both header and data. Only stat columns have the mismatch.

## Fix

Add `text-align:right` to numeric stat data cells (right-align is the standard for number columns — headers should also be right-aligned). Or consistently center both header and data.

In lab.js, when building data cells for numeric columns:
```javascript
html += `<td${scAttr}${hStyle} style="text-align:right;">${ldrDot}${formatStat(val, col.decimals)}</td>`;
```
And update headers to match:
```javascript
style="${cwStyle || 'width:80px;'} text-align:right;"
```

## Files
- `frontend/lab.js` line 1598 (headers), ~line 1850+ (data cells)
