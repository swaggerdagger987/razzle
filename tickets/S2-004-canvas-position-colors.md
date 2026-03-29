---
id: S2-004
severity: S2
category: design
title: "Canvas position colors use CSS variables with fallbacks"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S2-004: Position colors in canvas contexts

## Finding

The deep audit says some canvas-drawn charts may use hardcoded hex values for position colors.

## Root Cause Investigation

**Status: Already properly implemented.**

**File: `frontend/aging.html:413-417`** and **`frontend/explorer.html:357-361`**:
```javascript
var POS_COLORS = {
  QB: _cs.getPropertyValue('--pos-qb').trim() || '#5b7fff',
  RB: _cs.getPropertyValue('--pos-rb').trim() || '#2ec4b6',
  WR: _cs.getPropertyValue('--pos-wr').trim() || '#d97757',
  TE: _cs.getPropertyValue('--pos-te').trim() || '#8b5cf6'
};
```

Colors are read from CSS variables with hex fallbacks — the correct pattern. If design system colors change, canvas elements will update automatically.

## Conclusion

No action needed. Canvas colors already use CSS variables.
