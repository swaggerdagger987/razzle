---
id: S3-090
severity: S3
confidence: LOW
category: design-polish
source: BUG-008
status: OPEN
---

# Rankings and Values panels have inconsistent design treatment

## Root Cause

The rankings-related panels (Dynasty Rankings, Tier List, Trade Values, VORP, Report Cards) each use slightly different card layouts, spacing, and visual treatments despite serving similar data browsing purposes.

Inconsistencies include:
- Different card padding
- Different header styles
- Some use tier color bands, others don't
- Different position badge styling
- Different hover states

## Fix

Audit all rankings/value panels and normalize to a shared card component pattern. Consider creating a `.ranking-card` utility class.

## Files

- `frontend/rankings.html` — Dynasty Rankings
- `frontend/tiers.html` — Tier List
- `frontend/tradevalues.html` — Trade Values
- `frontend/vorp.html` — VORP Dashboard
- `frontend/reportcard.html` — Report Cards
- `frontend/lab-panels.css` — shared panel styles

## Acceptance Criteria

- All ranking panels use consistent card layout
- Position badges, hover states, and spacing match
- Dark mode works consistently across all
