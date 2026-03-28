# S2-049: Sitewide hover translate(-1px) should be translate(-2px) per DESIGN.md

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-131
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

DESIGN.md specifies hover-lift as `6px 6px 0` shadow + `translate(-2px, -2px)`. However, 38 instances across 16+ files use `translate(-1px, -1px)` instead.

## Affected Files

- `frontend/styles.css` — 5 instances (lines 226, 769, 797, 838, 1090)
- `frontend/lab-panels.css` — 2 instances (lines 2308, 4155)
- `frontend/lab.html` — 4 instances (lines 474, 2368, 2937, 3042)
- `frontend/league-intel.html` — 8 instances (lines 315, 520, 609, 637, 1752, 1998, 2162, 2283)
- `frontend/agents.html` — 8 instances (lines 86, 529, 560, 596, 1227, 1274, 1382, 1472)
- `frontend/matchups.html` — 2 instances (lines 92, 279)
- `frontend/prompts.html` — 2 instances (lines 42, 55)
- `frontend/aging.html`, `cheatsheet.html`, `scoring.html`, `targets.html`, `tools.html`, `weekly.html` — ~7 instances total

## Fix

Global find-replace:
- `translate(-1px, -1px)` → `translate(-2px, -2px)`
- `translate(-1px,-1px)` → `translate(-2px, -2px)` (no-space variant)

Review each to confirm it's a hover-lift context (not a different translate usage).

## Files to Change

- All 16+ files listed above

## Accept When

1. `grep -r "translate(-1px" frontend/` returns zero hover-lift results
2. All hover lifts use the spec'd -2px translate
3. Visual: cards/buttons lift slightly more on hover (matches design spec)
