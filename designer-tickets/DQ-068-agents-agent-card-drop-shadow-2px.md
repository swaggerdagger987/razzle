# DQ-068: agents.html agent card `drop-shadow(2px 2px 0 ...)` — undersized

**Priority**: P2 — Visible on every agent card in Situation Room
**Category**: Box Shadow Token
**Severity**: MEDIUM — undersized shadow on card-level element

## Problem

DESIGN.md specifies `4px 4px 0` as the standard at-rest shadow for cards. agents.html line ~285 uses `2px 2px 0` on agent card animation:

```css
filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
```

This is a card-level element (agent portraits/cards in the canvas area), not a small badge. The 2px exception only applies to small chips/badges with 2px borders.

Compare: index.html and about.html use `3px 3px 0` for mascot drop-shadows (also undersized per spec, but closer).

## Fix

Update to 4px offset:
```css
filter: drop-shadow(4px 4px 0 rgba(45,31,20,0.3));
```

Note: Also fixes the cold black color (covered in DQ-061), but the SIZE issue is separate.

## Verification

Agent cards in the Situation Room should have a visible chunky drop shadow matching the depth of other cards on the page.
