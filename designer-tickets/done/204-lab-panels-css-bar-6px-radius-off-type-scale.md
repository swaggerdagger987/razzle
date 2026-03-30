<!-- PM: ready -->
# DQ-417: lab-panels.css bar elements use 6px border-radius (off type scale)

**Priority**: P2
**Category**: Visual Consistency / Design System
**Files**: `frontend/lab-panels.css`

## Problem

DESIGN.md border-radius tokens: `8px` (sm), `12px` (default), `20px` (pills). The value `6px` is not on the type scale.

These bar elements use 6px:

| Line | Class | Current | Should Be |
|------|-------|---------|-----------|
| 618 | `.tv-bar-track` | `6px` | `8px` (var(--radius-sm)) |
| 3420 | `.pct2-bar-track` | `6px` | `8px` |
| 3421 | `.pct2-bar-fill` | `6px` | `4px` (inner fill smaller than container) |
| 3621 | `.td2-dist-bar` | `6px` | `8px` |

Also, `.db2-scar-bar-wrap` at line 3313 uses `4px` for a primary bar container (should be `8px`), with its fill `.db2-scar-bar` also at `4px`.

## What the user sees

Subtly inconsistent bar rounding across Trade Values, percentage displays, TD distribution, and scarcity bars vs. other rounded elements. Not catastrophic, but breaks the system.

## Fix

Replace all `6px` border-radius values with `var(--radius-sm)` (8px). Inner fill elements should be 4px (half of container radius).
