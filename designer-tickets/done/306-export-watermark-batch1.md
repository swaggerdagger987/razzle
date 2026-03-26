<!-- PM: ready -->
---
id: DQ-469b
parent: 469 (Standalone Export Watermark Epic)
priority: P3
area: 5 standalone HTML pages
section: DRY / design tokens
type: maintainability
status: open
pm_note: DQ-469a was never ticketed but getExportColors() already ships in app.js — unblocked
---

# Replace hardcoded export watermark colors — batch 1 (5 pages)

**Files**: `frontend/breakouts.html`, `frontend/efficiency.html`, `frontend/consistency.html`, `frontend/vorp.html`, `frontend/reportcard.html`

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

## Accept when

- No `rgba(237,224,207` or `rgba(45,31,20` in these 5 files
- No `#2d1f14` or `#ede0cf` in export sections of these 5 files
- PNG export still works correctly in both light and dark mode

## Root cause

Parent epic DQ-469. Shared `getExportColors()` already exists in `app.js`.
