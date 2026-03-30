# DES-062: lab.js has 14+ duplicated posColors objects with hardcoded hex

**Priority**: P2
**Area**: frontend/lab.js (Screener canvas code)
**Cycle**: 6

## Problem

lab.js defines the same `posColors` / `POS_COLORS` object 14+ times across different functions:

```javascript
const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
```

Each is a separate hardcoded copy. Problems:
1. **DRY violation** — 14 copies of the same 4 colors
2. **Dark mode** — hardcoded hex can't adapt to theme changes
3. **Maintenance** — if position colors change in DESIGN.md, must find all 14+ copies

## Instances Found (line numbers)

5689, 6066, 6175, 6755, 6923, 7429, 7475, 8439, 8693, 9001, 9050, 9136, 9186, 10211

## Fix

1. Define ONE position colors constant at the top of lab.js that reads from CSS:
   ```javascript
   function getPosColors() {
     const s = getComputedStyle(document.documentElement);
     return {
       QB: s.getPropertyValue('--pos-qb').trim(),
       RB: s.getPropertyValue('--pos-rb').trim(),
       WR: s.getPropertyValue('--pos-wr').trim(),
       TE: s.getPropertyValue('--pos-te').trim()
     };
   }
   ```
2. Replace all 14+ inline objects with calls to this function
3. For canvas contexts, use the existing `getCanvasTheme()` pattern

## Design Rule

DESIGN.md defines position color tokens (`--pos-qb`, `--pos-rb`, `--pos-wr`, `--pos-te`). All code should reference these tokens, not hardcode the hex values.
