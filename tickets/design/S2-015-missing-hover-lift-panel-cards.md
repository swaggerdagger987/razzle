# S2-015: Missing hover lift on many panel cards

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-TICKETS.md #9
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md specifies cards should lift on hover: `6px 6px 0 + translate(-2px, -2px)`. Many standalone panel pages define cards with `3px` or `4px` shadows but have no `:hover` transition. Cards feel static/dead.

The Lab and home page have proper hover lift, but `.lp-card`, `.stat-card`, and `.tool-card` classes in `lab-panels.css` and standalone HTML files lack hover states.

## Fix

Add a shared `.card-hover` utility class in `styles.css`:
```css
.card-hover {
  transition: box-shadow 0.15s, transform 0.15s;
}
.card-hover:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

Then add `card-hover` class to card elements across standalone pages.

## Files to Change

- `frontend/styles.css` — add `.card-hover` utility
- `frontend/lab-panels.css` — add hover to `.lp-card`
- All standalone panel HTML files with card elements — add `card-hover` class

## Accept When

Cards across all pages lift on hover with `6px 6px 0` shadow + translate animation.
