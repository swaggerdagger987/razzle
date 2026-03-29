# S2-024: SUPERSEDED by S2-023

**Status**: superseded
**Superseded by**: `tickets/ux/S2-023-hero-150-stat-columns-claim-inflated.md`
**Reason**: Duplicate finding. S2-023 has corrected info — actual hero text says "100+", not "150+".

---

*Original content below for reference:*

# S2-024: Hero section claims "150+" stat columns but Lab has 87

**Severity**: S2 (Minor)
**Category**: football-accuracy
**Source**: Deep Audit 2026-03-28, finding S2-001

## Problem

The landing page hero section claims "150+ stat columns" but the Lab screener's
COLUMNS object defines 87 columns. The number may include college + prospect columns
across all modes combined, but this is misleading since users don't see 150 columns
simultaneously.

## Root Cause

- `frontend/index.html:655` — Hero text:
  `"150+ stat columns. Custom formulas. Shareable views. No account required. No catch."`
- `frontend/lab.js:790-907` — COLUMNS object contains exactly 87 column definitions
  for NFL mode

## Fix

Change hero text to an accurate count. Options:
1. `"100+ stat columns across NFL, college, and prospects"` (most honest)
2. `"87 NFL stat columns + custom formulas"` (most specific)
3. Count the actual total across all modes (NFL + college + prospects) and use that number

## Scope

- 1 file: `frontend/index.html`
- 1 line change
