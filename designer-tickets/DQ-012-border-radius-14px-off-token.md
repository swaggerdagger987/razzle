# DQ-012: Off-token border-radius 14px in 4 files

**Priority**: P2 — subtle but visually inconsistent across panel pages
**Category**: Border radius token

## Problem

DESIGN.md defines three radius tokens: `8px` (--radius-sm), `12px` (--radius), `20px` (--radius-lg). Four locations use `14px`, which is not in the token set.

## Locations

| File | Line | Selector |
|------|------|----------|
| `frontend/archetypes.html` | 115 | `.arch-card` |
| `frontend/dashboard.html` | 113 | `.db-section` |
| `frontend/lab-panels.css` | 411 | (panel card) |
| `frontend/tiers.html` | 120 | `.tl-tier` |

## Fix

Change `border-radius: 14px` → `border-radius: var(--radius)` (12px) in all 4 locations. These are card-level containers, so `--radius` (12px) is the correct token.

## Verification

Inspect each element — radius should match other cards on the same page.
