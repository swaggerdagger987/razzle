# DQ-011: Sitewide box-shadow undersized (2px/3px instead of 4px at rest)

**Priority**: P1 — visible on every page, 72 instances across 22 files
**Category**: Box shadow token

## Problem

DESIGN.md specifies `4px 4px 0 var(--ink)` as the standard at-rest box-shadow for cards and containers. 72 instances across 22 HTML files use `2px 2px 0` or `3px 3px 0` instead. This makes the entire site look thinner and flatter than the design spec intends.

## Scope

**Files with 2px/3px at-rest shadows (top offenders):**
- `frontend/lab.html` — 17 instances (toggles, badges, modals, panels)
- `frontend/league-intel.html` — 13 instances
- `frontend/agents.html` — 10 instances
- `frontend/tiers.html` — 4 instances
- `frontend/matchups.html` — 4 instances
- `frontend/leaders.html` — 3 instances
- `frontend/tools.html` — 3 instances
- 15 more files with 1-2 instances each

## Fix

Search-replace `box-shadow: 2px 2px 0` → `box-shadow: 4px 4px 0` on card-level elements.

**Exception**: Small inline badges/chips (like the "recommended" pill on pricing) may use `2px 2px 0` intentionally since they use 2px borders. Use judgment: if the element has a `3px solid` border, its shadow should be `4px 4px 0`. If it has a `2px solid` border and is badge-sized, `2px 2px 0` is acceptable.

For `3px 3px 0` — always upgrade to `4px 4px 0`. There is no design token for 3px shadows.

## Verification

Compare any card/container shadow visually. It should have a clearly visible chunky offset, not a subtle thin line.
