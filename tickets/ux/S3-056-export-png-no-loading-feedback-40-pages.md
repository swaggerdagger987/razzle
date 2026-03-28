---
id: S3-056
severity: S3
confidence: HIGH
category: ux-flow
source: DQ-170
status: OPEN
---

# Export PNG buttons have no loading feedback — 40+ pages

## Root Cause

All standalone pages with html2canvas export show no visual feedback when the export button is clicked. The screenshot generation takes 1-3 seconds, during which the button appears unresponsive. No loading state, no spinner, no disabled state.

## Fix

Add loading state to export buttons:
```js
btn.disabled = true;
btn.textContent = 'Exporting...';
html2canvas(el).then(function(canvas) {
  // ... download logic ...
}).finally(function() {
  btn.disabled = false;
  btn.textContent = 'Export PNG';
});
```

## Files

- 40+ standalone HTML files with export buttons

## Acceptance Criteria

- Export button shows loading state during screenshot generation
- Button disabled while export is in progress
- Button restores after completion or failure
