<!-- PM: ready -->
---
id: DQ-469a
parent: 469 (Standalone Export Watermark Epic)
priority: P3
area: frontend/app.js
section: DRY / design tokens
type: shared utility
status: open
---

# Create getExportColors() shared function in app.js

**File**: `frontend/app.js`

## What to do

Add a shared function that centralizes export watermark colors currently duplicated across 10 standalone pages:

```javascript
function getExportColors() {
  var isDark = document.documentElement.dataset.theme === 'dark';
  return {
    bg: isDark ? '#2d1f14' : '#ede0cf',
    watermark: isDark ? 'rgba(237,224,207,0.3)' : 'rgba(45,31,20,0.3)'
  };
}
```

## Accept when

- `getExportColors()` exists in app.js and is globally accessible
- Returns `{ bg, watermark }` with correct dark/light values
- Does not break any existing functionality

## Why this comes first

DQ-469b and DQ-469c depend on this function existing before they can replace the inline duplicates.
