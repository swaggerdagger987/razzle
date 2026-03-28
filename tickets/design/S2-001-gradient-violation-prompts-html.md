# S2-001: Gradient in prompts.html violates "NO gradients" rule

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-400
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/prompts.html:78` — Uses `linear-gradient()` which DESIGN.md explicitly prohibits under the "Don't" list.

```css
background: linear-gradient(transparent, var(--bg)); pointer-events: none;
```

This is a fade overlay at the bottom of a scrollable container.

## Fix

Replace gradient with solid background + partial opacity:
```css
background: var(--bg); opacity: 0.9; pointer-events: none;
```

Or remove the fade overlay entirely if not critical to the design.

## Files to Change

- `frontend/prompts.html:78`

## Accept When

Zero instances of `linear-gradient` in any frontend file (verify with grep).
