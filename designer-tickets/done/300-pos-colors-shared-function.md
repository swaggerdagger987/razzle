<!-- PM: ready -->
---
id: DQ-360a
parent: 360 (POS_COLORS Duplicate Inline)
priority: P3
area: frontend/app.js
section: shared utilities
type: DRY / maintainability
status: open
---

# Add shared getPosColors() function to app.js

**File**: `frontend/app.js`

## What to do

Add a shared function that reads position colors from CSS variables with fallbacks:

```javascript
function getPosColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    QB: s.getPropertyValue('--pos-qb').trim() || '#5b7fff',
    RB: s.getPropertyValue('--pos-rb').trim() || '#2ec4b6',
    WR: s.getPropertyValue('--pos-wr').trim() || '#d97757',
    TE: s.getPropertyValue('--pos-te').trim() || '#8b5cf6'
  };
}
```

This function will be consumed by DQ-360b and DQ-360c.

## Accept when

- `getPosColors()` exists in app.js
- Returns correct colors matching CSS variables
- Fallback hex values match DESIGN.md
