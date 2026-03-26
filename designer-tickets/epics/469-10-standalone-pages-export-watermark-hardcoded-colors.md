# DQ-469: 10 Standalone Pages Hardcode Export Watermark Colors

**Priority**: P3
**Category**: Design Token / Maintainability
**Affects**: All 10 standalone panel pages with PNG export

## Problem

Every standalone page with PNG export (html2canvas) hardcodes the same watermark overlay colors inline:

```javascript
ctx.fillStyle = document.documentElement.dataset.theme === 'dark'
  ? 'rgba(237,224,207,0.3)'   // sand at 30%
  : 'rgba(45,31,20,0.3)';     // espresso at 30%
```

And html2canvas backgroundColor:
```javascript
html2canvas(el, { backgroundColor: isDark ? '#2d1f14' : '#ede0cf' })
```

This pattern is duplicated across 10 files. If design colors change, 10 files need updating.

## Pages Affected

breakouts.html, efficiency.html, consistency.html, vorp.html, reportcard.html, awards.html, stocks.html, opportunity.html, garbagetime.html, dualthreat.html

## Fix

Extract to a shared function in app.js:
```javascript
function getExportColors() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  return {
    bg: isDark ? '#2d1f14' : '#ede0cf',
    watermark: isDark ? 'rgba(237,224,207,0.3)' : 'rgba(45,31,20,0.3)'
  };
}
```

Then each page calls `getExportColors()` instead of hardcoding.

## Acceptance

Grep `rgba(237,224,207` and `rgba(45,31,20` in standalone HTML files returns 0 matches (moved to app.js).
