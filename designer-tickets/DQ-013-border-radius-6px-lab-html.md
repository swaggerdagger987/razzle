# DQ-013: Off-token border-radius 6px in lab.html

**Priority**: P2 — affects Lab components
**Category**: Border radius token

## Problem

Two locations in `frontend/lab.html` use `border-radius: 6px`, which is not in the design token set (8px/12px/20px).

## Locations

| Line | Context |
|------|---------|
| 2246 | Style block component |
| 2493 | Style block component |

## Fix

Change `border-radius: 6px` → `border-radius: var(--radius-sm)` (8px) in both locations. These are small elements, so `--radius-sm` is the correct token.

## Verification

Inspect the two elements — corners should match the 8px standard for small components.
