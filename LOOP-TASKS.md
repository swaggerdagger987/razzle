# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Pre-Launch Hardening + Bureau SOS
- Current Task: COMPLETE
- Current Stage: DONE
- Tasks Completed: 4/4
- Loop Iterations: 1

## Phase Spec

**Goal**: Close security gaps and complete the Bureau feature set before March 16 launch.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Server-side trial expiry validation | VERIFIED | Already working — get_current_user() re-fetches from DB, _user_dict() recomputes trial_active and adjusts effective plan server-side. JWT plan claim is ignored. |
| 2 | Formula count server-side enforcement | DONE | save_user_formula already enforced (3-formula cap for free). Fixed import endpoint bypass — /api/user/formulas/import now checks plan + caps import to remaining slots for free users. |
| 3 | Bureau SOS panel | DONE | Phase 2-8 complete. "Schedule Strength" button in Bureau. Fetches roster PPGs + matchup heatmap, computes best/worst case PPG per manager, swing score, volatility grade (volatile/exposed/neutral/stable/rock solid). Team concentration chips. Free users see top 3, Pro sees all. |
| 4 | Final verification | DONE | 59/59 tests pass. JavaScript syntax validated. No regressions. |
