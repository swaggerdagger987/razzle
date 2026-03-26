<!-- PM: ready -->
---
id: DQ-469c
parent: 469 (Standalone Export Watermark Epic)
priority: P3
area: 5 standalone HTML pages
section: DRY / design tokens
type: maintainability
status: open
depends_on: DQ-469a
---

# Replace hardcoded export watermark colors — batch 2 (5 pages)

**Files**: `frontend/awards.html`, `frontend/stocks.html`, `frontend/opportunity.html`, `frontend/garbagetime.html`, `frontend/dualthreat.html`

## What to do

In each file, find the duplicated export color logic:
```javascript
ctx.fillStyle = document.documentElement.dataset.theme === 'dark'
  ? 'rgba(237,224,207,0.3)' : 'rgba(45,31,20,0.3)';
```
and:
```javascript
html2canvas(el, { backgroundColor: isDark ? '#2d1f14' : '#ede0cf' })
```

Replace with:
```javascript
var exportColors = getExportColors();
ctx.fillStyle = exportColors.watermark;
// ...
html2canvas(el, { backgroundColor: exportColors.bg })
```

Final sweep: `grep -rn "rgba(237,224,207" frontend/*.html` should return 0 matches.

## Accept when

- Zero hardcoded export watermark colors remain in any standalone HTML page
- PNG export still works correctly in both light and dark mode

## Depends on

DQ-469a (shared function must exist first)
