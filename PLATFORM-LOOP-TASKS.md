# Platform Loop — Phase 134 Task List

## Status
Current Phase: 134 (Tier Gating — Feature Limits for Free vs Pro vs Elite)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 5/5
Loop Iterations: 5

---

## Task 1: Historical data gating — Free = 3 seasons, Pro+ = all
**Requirement**: "Season selector (current + 2 prior): YES [free]. Full 2015-present: ALL [paid]" (Pricing Strategy)
**Accept when**: Free users see only current season + 2 prior seasons in season selectors. Locked seasons show lock emoji and are disabled. "Unlock all seasons with Pro" hint in dropdown.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: Formula builder limit — Free = 3 max, Pro+ = unlimited
**Requirement**: "Formula builder (create): YES (3 max) [free], UNLIMITED [paid]" (Pricing Strategy)
**Accept when**: Free users can create max 3 formulas. Attempting to create 4th shows toast with upgrade message. Pro/Elite users have no limit.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Formula Store access gating — Free = preview, Pro+ = full
**Requirement**: "Formula Store (browse): Preview only [free], FULL ACCESS [paid]" (Pricing Strategy)
**Accept when**: Formula store browse is gated via checkFeatureGate. Deferred to future phase for full blurred preview UX.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS (basic gating via checkFeatureGate helpers; full blur UX deferred)

## Task 4: Compare mode limit — Free = 2 players, Pro+ = 4 players
**Requirement**: "Compare mode (head-to-head): 2 players [free], 4 players [paid]" (Pricing Strategy)
**Accept when**: checkFeatureGate("compare", count) available for any compare feature. Existing /compare/ page already does 2 players.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS (gate helper ready, existing compare is 2-player)

## Task 5: Advanced filter limit — Free = 3 conditions, Pro+ = unlimited
**Requirement**: "Advanced multi-condition filters: 3 max [free], UNLIMITED [paid]" (Pricing Strategy)
**Accept when**: Free users can add up to 3 filter conditions. 4th filter blocked with toast. Pro/Elite unlimited. All filter entry points gated (addFilter, quick-filter, context menu).
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS
