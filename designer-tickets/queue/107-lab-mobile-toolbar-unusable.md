# DQ-107: Lab mobile (375px) toolbar is cramped and unusable

**Priority**: P2
**Category**: Mobile / Touch UX
**Page**: lab.html
**Evidence**: lab-light-mobile.png

## Problem

At 375px width, the Lab screener toolbar has too many buttons competing for space: NFL toggle, position selector, season selector, preset stats dropdowns, Columns, Formulas, + Filter. The buttons are tiny, touch targets are well below the 44px minimum for mobile, and the row is cramped.

The data table itself scrolls horizontally (which is fine), but the toolbar — the primary interaction point — is nearly unusable on phone screens. Users can't comfortably tap "Add Filter" or "Columns" without accidentally hitting adjacent buttons.

## Fix

At `@media (max-width: 480px)`:

1. Wrap the toolbar to 2 rows: Row 1 = NFL/NCAA toggle + Position + Season. Row 2 = Stats preset + Columns + Formulas + Filter
2. OR collapse secondary controls (Columns, Formulas, Stats presets) behind a "More..." dropdown menu, keeping NFL toggle + Position + Filter as the primary row
3. Ensure all remaining buttons have min 44px touch targets
4. Consider making the + Filter button full-width on mobile since it's the primary action

## Verification

View lab.html at 375px width. All toolbar controls should be comfortably tappable. No buttons should overlap or be too small to hit accurately.
