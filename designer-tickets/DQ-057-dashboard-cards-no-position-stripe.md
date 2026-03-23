---
id: DQ-057
priority: P2
category: design spec
page: dashboard.html
status: open
---

# Dashboard top-5 player cards missing position-colored top stripe

## What's wrong

DESIGN.md line 159: "Cards: 3px ink border, offset shadow, **position-colored top stripe (6px)**"

The `.db-top5-card` class (line 65-75) has correct border and shadow but NO position-colored top stripe:

```css
.db-top5-card {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: 12px;
  box-shadow: 4px 4px 0 var(--ink);
  /* NO border-top override */
}
```

All 5 top player cards look identical regardless of whether the player is a QB, RB, WR, or TE. The position badge inside the card shows position, but the card itself has no visual differentiation.

Compare to `tools.html` (lines 210-216) and `lab.js` (line 7183) which correctly use `border-top: 6px solid [position-color]`.

## Evidence

- dashboard.html line 65-75: no `border-top` on `.db-top5-card`
- dashboard.html line 488-492: `renderTop5()` creates cards without position-aware styling
- Screenshot: 5 identical white/cream cards at top of dashboard

## Fix

In `renderTop5()`, add position-colored top stripe:
```javascript
html += '<div class="db-top5-card" style="border-top: 6px solid var(--pos-' + p.position.toLowerCase() + ');">';
```

Note: This requires DQ-051 fix first (undefined `--qb` vars must be changed to `--pos-qb`).

## Files
- `frontend/dashboard.html` (line 65 CSS, line 488 JS)
