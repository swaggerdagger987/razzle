# DQ-039: Lab mobile toolbar cramped touch targets

**Priority**: P2 — mobile usability
**Page**: lab.html
**Category**: Responsive / touch targets

## Problem

At 375px viewport, the Lab toolbar (position badges, search, Columns, Formulas, + Filter buttons, preset dropdown) is extremely cramped. Buttons are squeezed together with minimal spacing, making them difficult to tap accurately on mobile.

WCAG 2.1 Success Criterion 2.5.8 recommends minimum 44x44px touch targets. Several toolbar buttons fall below this.

## Evidence

- Screenshot of lab.html at 375x812 shows toolbar buttons compressed into a single row
- Position badge buttons (ALL, QB, RB, WR, TE) are ~30px wide
- Columns/Formulas/Filter buttons are ~60px wide but only ~28px tall
- Gap between buttons appears to be 2-4px, insufficient for fat-finger prevention

## Fix

At mobile breakpoint (max-width: 480px), either:
1. **Wrap toolbar into 2 rows**: position badges on row 1, action buttons on row 2
2. **Collapse low-priority buttons**: hide Columns/Formulas/Export behind a "..." overflow menu
3. **Increase button heights**: set `min-height: 44px` on all toolbar buttons at mobile

Option 1 is simplest. Add to responsive CSS:
```css
@media (max-width: 480px) {
  .toolbar { flex-wrap: wrap; gap: 8px; }
  .toolbar-actions { width: 100%; }
}
```
