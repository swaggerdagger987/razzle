---
id: S3-031
severity: S3
category: ui-bug
finding_ref: EDGE-66
confidence: HIGH
---

# S3-031: exportPanelCSV() missing UTF-8 BOM for Excel compatibility

## Root Cause

`frontend/lab.js:72`:
```javascript
var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
```

The `exportPanelCSV()` function (lines 40-72) creates CSV without a UTF-8 BOM prefix.
When opened in Excel, non-ASCII characters (accented player names, special symbols)
display as garbled text.

The other CSV exporter `exportCSV()` at line 6058 DOES include the BOM correctly:
```javascript
const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
```

## What to Fix

Add BOM to `exportPanelCSV()`:

```javascript
var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
```

## Files to Change

- `frontend/lab.js` — Line 72, prepend `"\uFEFF"` to csv content

## Acceptance Criteria

- [ ] exportPanelCSV() output opens correctly in Excel with proper encoding
- [ ] Both CSV export paths use identical BOM prefix

## Do NOT

- Do not change the exportCSV() function — it already works correctly
