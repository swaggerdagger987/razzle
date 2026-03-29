# S2-005: Off-token border-radius (13px, 14px) — should be 12px or 20px

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-405
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md defines three radius tokens: `--radius-sm` (8px), `--radius` (12px), `--radius-lg` (20px). Five files use 13px or 14px which fall between tokens:

- `frontend/archetypes.html:115` — 14px
- `frontend/dashboard.html:113` — 14px
- `frontend/lab-panels.css:411` — 14px
- `frontend/tiers.html:120` — 14px
- `frontend/pricing.html:41` — 13px

## Fix

Replace 14px with `var(--radius)` (12px) for card-like elements.
Replace 13px with `var(--radius-lg)` (20px) for pill-shaped toggles (pricing.html).

## Files to Change

- `frontend/archetypes.html:115` — 14px → `var(--radius)`
- `frontend/dashboard.html:113` — 14px → `var(--radius)`
- `frontend/lab-panels.css:411` — 14px → `var(--radius)`
- `frontend/tiers.html:120` — 14px → `var(--radius)`
- `frontend/pricing.html:41` — 13px → `var(--radius-lg)`

## Accept When

Zero instances of `border-radius: 13px` or `border-radius: 14px` in any frontend file.
