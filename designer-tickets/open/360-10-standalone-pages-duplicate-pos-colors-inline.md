---
id: DQ-360
priority: P3
area: 10 standalone HTML pages (Phase 130+)
section: JavaScript
type: DRY violation / maintainability
status: open
---

# 10 standalone pages each re-declare POS_COLORS with getPropertyValue + fallback

## What's wrong

DQ-062 fixed POS_COLORS duplication in lab.js. DQ-007 covers charts.js. But 10 Phase 130+ standalone pages each independently declare the same pattern:

```javascript
const _cs = getComputedStyle(document.documentElement);
const POS_COLORS = {
  QB: _cs.getPropertyValue("--pos-qb").trim() || "#5b7fff",
  RB: _cs.getPropertyValue("--pos-rb").trim() || "#2ec4b6",
  WR: _cs.getPropertyValue("--pos-wr").trim() || "#d97757",
  TE: _cs.getPropertyValue("--pos-te").trim() || "#8b5cf6"
};
```

10 copies of the same 6-line block, each with hardcoded hex fallbacks that can drift from DESIGN.md.

## Where

- workload.html
- targetpremium.html
- seasonpace.html
- garbagetime.html
- snapefficiency.html
- dualthreat.html
- tdregression.html
- advantage.html
- weeklymvp.html
- weeklyleaders.html

## Suggested fix

Add a shared `getPosColors()` function to app.js:

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

Then replace all 10 inline declarations with `const POS_COLORS = getPosColors();`.

## Why this matters

DRY. If position colors ever change, 10 pages won't update. Single function, single truth.
