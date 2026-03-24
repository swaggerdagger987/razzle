---
id: DQ-371
title: 65 standalone page PNG exports each hardcode dark mode background ternary inline
priority: P2
category: design-system / maintainability
page: 65 standalone HTML pages
status: open
cycle: 49
---

## Problem

Every standalone page with PNG export has the same dark mode background ternary hardcoded inline:

```javascript
html2canvas(root, {
  backgroundColor: document.documentElement.dataset.theme === 'dark' ? '#2d1f14' : '#ede0cf',
  scale: 2
}).then(function(canvas) { ... });
```

65 separate files each duplicate these hex values. If the Espresso Flip palette changes (DESIGN.md), 65 files need manual updates. This is the single largest design token violation remaining.

## Evidence

```bash
grep -c "2d1f14.*ede0cf" frontend/*.html
# 65 files match
```

Example files: advantage.html, aging.html, airyards.html, archetypes.html, auction.html, awards.html, breakdown.html, breakouts.html, buysell.html, career.html, ... (65 total)

## Fix

1. Add a shared helper to `app.js`:
```javascript
function getExportBackground() {
  return document.documentElement.dataset.theme === 'dark'
    ? getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    : getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
```

2. Replace all 65 inline ternaries with:
```javascript
html2canvas(root, { backgroundColor: getExportBackground(), scale: 2 })
```

## Verification

`grep -c "'#2d1f14'" frontend/*.html` should return 0 after fix.
