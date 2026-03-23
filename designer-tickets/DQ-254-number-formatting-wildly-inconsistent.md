---
id: DQ-254
title: Number formatting wildly inconsistent across pages — decimals, commas, raw floats
priority: P2
category: data consistency
status: open
cycle: 35
---

## Problem

Different pages format the same stat types differently:
- `compare.js` line 190: `.toLocaleString()` (adds commas)
- `advantage.html` line 192: `.toFixed(1)` (1 decimal, no commas)
- `airyards.html` line 469: `.toFixed(1) + '%'` (manual percent)
- `career.html` line 320: no formatting at all (raw float like "10.333333")

Users see "1,234" on one page, "1234.0" on another, and "1234.333" on a third — for the same underlying data. This undermines data credibility.

## Evidence

`grep -rn "toFixed" frontend/*.html frontend/*.js` shows ~50 instances with different decimal precision (0, 1, 2). `grep -rn "toLocaleString" frontend/` shows ~8 instances. Many pages have no formatting at all.

## Fix

Create a shared formatter in `frontend/app.js`:
```javascript
function fmtStat(v, type) {
  if (v == null || v === '') return '\u2014';
  v = Number(v);
  if (type === 'int') return Math.round(v).toLocaleString();
  if (type === 'pct') return v.toFixed(1) + '%';
  if (type === 'dec1') return v.toFixed(1);
  if (type === 'dec2') return v.toFixed(2);
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1);
}
```

Then migrate standalone pages to use it. This is a larger lift but the impact on data credibility is significant.

## Files
- `frontend/app.js` — add shared formatter
- 20+ standalone HTML files — migrate to use formatter

## Impact
Data credibility. Fantasy football users are stat obsessives — inconsistent formatting erodes trust.
