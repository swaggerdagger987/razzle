# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Monte Carlo Deep-Dive + Bureau Polish
- Current Task: DONE
- Current Stage: COMPLETE
- Tasks Completed: 4/4
- Loop Iterations: 1

## Phase: Monte Carlo Deep-Dive (Mar 14)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Distribution histograms | DONE | Canvas histograms in each odds card showing PPG distribution (15-bin, color-coded frequency). Pro only. |
| 2 | Scenario explorer | DONE | Injury toggle (mark player OUT, instant re-sim) + trade what-if (swap players between rosters, instant re-sim). Delta badges show odds changes. All client-side, no API calls. |
| 3 | Coming soon: ESPN, Yahoo | DONE | Badges on Bureau connect card below Sleeper link notice. |
| 4 | Verification | DONE | 59/59 tests pass, 11/11 JS syntax clean. |

## Verification (Mar 14)
- 59/59 tests pass (16.60s)
- 11/11 JS files pass syntax check
- Monte Carlo refactored: simulation logic extracted to _mcSimulate(), state stored in _mcState for re-use
- Distribution histograms render per-manager PPG spread via canvas
- Scenario explorer: injury toggles + trade what-if with instant re-simulation
- Delta badges (green/red +/- percentages) show how scenarios change odds
- All new functions use escapeHtml/escapeAttr for user data
- Pro gating maintained (free users see top 3 + upgrade CTA)

**To queue more work:** Add phase specs to TICKETS.md.
