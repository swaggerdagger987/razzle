# S2-006: Normalize box-shadow offsets — 3px/5px to 4px/6px standard

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-TICKETS.md #1
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md specifies cards use `4px 4px 0 var(--ink)` (resting) and `6px 6px 0` (hover). The codebase has 33 occurrences of `3px 3px 0` and 11 occurrences of `5px 5px 0` from earlier iterations.

**3px 3px 0** (33 hits in 18 files):
- `styles.css` (5), `lab-panels.css` (3)
- `lab.html` (4), `league-intel.html` (4), `tools.html` (3)
- `about.html`, `agents.html`, `aging.html`, `cheatsheet.html`, `index.html`, `matchups.html`, `pricing.html`, `prompts.html`, `rosterbuilder.html`, `scoring.html`, `targets.html`, `tiers.html`, `weekly.html` (1 each)

**5px 5px 0** (11 hits in 7 files):
- `styles.css` (3), `league-intel.html` (3)
- `about.html`, `agents.html`, `index.html`, `lab.html`, `matchups.html` (1 each)

## Fix

Context-dependent replacement:
- `3px 3px 0` on card resting state → `4px 4px 0`
- `5px 5px 0` on card hover state → `6px 6px 0`
- `5px 5px 0` on card resting state → `4px 4px 0` (card-hero exception documented in DES-407)

Review each occurrence to confirm card vs hover context before replacing.

## Files to Change

All 25 files listed above. Batch replacement with manual review per file.

## Accept When

1. Zero instances of `3px 3px 0` box-shadow in frontend files
2. Zero instances of `5px 5px 0` box-shadow on resting state cards
3. All hover states use `6px 6px 0`
4. All resting states use `4px 4px 0`
