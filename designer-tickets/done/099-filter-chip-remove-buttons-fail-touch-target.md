# DES-099: Filter/team chip remove (x) buttons fail 24px touch target minimum

**Priority**: P1
**Area**: lab.html (CSS lines 785-848), lab-panels.css (lines 2954, 3519)
**Cycle**: 10

## Problem

The Lab screener's filter chip and team chip remove buttons are tiny icon-only targets with no padding:

| Element | Selector | Approx size | Minimum |
|---------|----------|-------------|---------|
| Filter tag × | `.filter-tag .remove` | ~13×17px | 24×24px |
| Team chip × | `.team-chip .remove` | ~12×16px | 24×24px |
| Compare chip × | `.ccp-chip-rm` | ~16×16px (padding: 0 2px) | 24×24px |
| Roster builder × | `.rbld-remove-btn` | ~18×8px (padding: 0 4px) | 24×24px |

These are the most-used interactive elements in the screener. A dynasty power user adding 5+ filters will tap these remove buttons repeatedly. On mobile (where most Twitter/Reddit traffic lands), these are nearly impossible to hit accurately.

## Fix

Add minimum touch target sizing to all remove/close icon buttons:

```css
.filter-tag .remove {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.team-chip .remove {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Same pattern for `.ccp-chip-rm` and `.rbld-remove-btn` in lab-panels.css.

The visual size can stay small — use padding/margin to expand the **hit area** without changing the visible footprint:

```css
.filter-tag .remove {
  padding: 4px 6px;
  margin: -4px -6px; /* negative margin keeps visual position */
}
```

## Design Rule

WCAG 2.5.8: Target Size (Minimum). All interactive targets must be at least 24×24 CSS pixels. Mobile-first traffic from Twitter/Reddit makes this especially critical for Razzle's growth funnel.
