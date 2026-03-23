# DES-054: formula-store.js position tag badges use border-radius:4px

**Priority**: P2
**Area**: formula-store.js (Formula Store overlay)
**Found by**: Design QA Cycle 5

## Problem

Line 517 in formula-store.js generates position tag badges with `border-radius:4px` — below the `--radius-sm` (8px) design minimum:

```javascript
return `<span style="...border-radius:4px; border:2px solid var(--ink); background:${colors[p]}; color:var(--text-on-accent)...">${escapeHtml(p)}</span>`;
```

These badges appear on every formula card in the Formula Store. The 4px radius looks tight and sharp compared to the rest of the UI which uses 8px minimum.

## Conversion impact

Formula Store is a Pro-only feature used during the "explore → import → upgrade" conversion path. Inconsistent badge styling makes the feature feel less polished than the main Lab.

## Fix

Replace `border-radius:4px` with `border-radius:8px` on line 517.
