# S2-047: overflow:hidden clips 4px box-shadows on panel cards

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-022
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab-panels.css` — Multiple card classes apply both `overflow: hidden` and `box-shadow: 4px 4px 0 var(--ink)`. Since box-shadow renders outside the element's border-box, `overflow: hidden` clips the right and bottom shadow edges, making the chunky comic-strip shadow appear cut off.

Affected classes (lab-panels.css):
- `.pa-card` (line 752)
- `.ra-card` (line 1845)
- `.tl-card` (line 1894)
- `.av-card` (line 1929)
- `.ar-card` (line 1968)
- `.cs-card` (line 2005)
- `.rs-card` (line 2041)
- `.sc-card` (line 2080)
- `.bb-card` (line 3139)

Example:
```css
.pa-card {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: var(--radius-sm);
  box-shadow: 4px 4px 0 var(--ink);
  overflow: hidden; /* clips the box-shadow */
}
```

## Fix

For each affected card class, choose one:
1. Remove `overflow: hidden` if it's not needed (check if any child content overflows)
2. Keep `overflow: hidden` but move `box-shadow` to a wrapper div that doesn't clip
3. Replace `overflow: hidden` with `overflow: clip` and add 4px padding-right/bottom to accommodate shadow (not well supported)

Option 1 is preferred — audit each card to see if `overflow: hidden` is actually needed.

## Files to Change

- `frontend/lab-panels.css` — 9 card classes listed above

## Accept When

1. Box-shadows on panel cards are fully visible (not clipped)
2. No child content overflows its card container
