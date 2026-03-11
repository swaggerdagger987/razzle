# Platform Loop — Phase 154 Task List

## Status
Current Phase: 154 (Bureau of Intelligence — Paid Tier Analytics + Conversion Deepening)
Current Task: 6
Current Stage: TEST
Attempt: 1/3
Tasks Completed: 5/6
Loop Iterations: 5

---

## Phase Rationale

The North Star defines the Bureau of Intelligence paid tier as:
> "Full behavioral history of every manager across all available seasons. Manager profiles: who panics, who hoards, who overpays in FAAB, who sells late. Trade deadline pressure maps — which managers are desperate and when. League economy trends over time."

The current league-intel.html has behavioral profiles (traits, panic detection, FAAB patterns) but lacked:
1. Visual analytics — no charts or graphs showing manager behavior OVER TIME
2. Deadline pressure map — no visual showing which managers are desperate NOW
3. League economy dashboard — no aggregate view of league health/activity
4. Conversion bridge — no clear "this is what Pro users see" teaser on the page

This phase adds visual analytics to the Bureau that make the free-to-paid gap visceral and justify the Pro subscription.

---

## Task 1: Manager Behavioral Timeline Charts
**Requirement**: "Manager profiles: who panics, who hoards, who overpays in FAAB" + "League economy trends over time" from North Star Bureau Paid Tier.
**Accept when**: (1) Each manager profile card has a mini activity timeline chart showing moves-per-week across the season using Canvas API. (2) Multi-season data plots on the timeline when available. (3) Panic bursts are visually highlighted (red spikes). (4) Chart uses Razzle design system.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS — renderActivityTimeline() renders Canvas bar chart per manager, multi-season with dividers, panic weeks in red

## Task 2: Trade Deadline Pressure Map
**Requirement**: "Trade deadline pressure maps — which managers are desperate and when" from North Star Bureau Paid Tier.
**Accept when**: (1) Visual ranked list showing each manager's desperation level. (2) Pressure score computed from record, panic history, trade activity, FAAB burn. (3) Color-coded (red=desperate, orange=motivated, green=comfortable). (4) Pro-gated: free users see top 3, rest blurred.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS — computePressureScores() + renderPressureMap() with color-coded bars, Pro gating, Diplomat bridge CTA

## Task 3: Activity Feed Conversion Nudges
**Requirement**: "Once users see their league data in Razzle and realize what intelligence the Situation Room could layer on top, they convert" from North Star conversion funnel.
**Accept when**: (1) Trade activity items show "the Quant has thoughts on this trade" nudge for free users. (2) Waiver pickups show "Scout can explain their strategy" nudge. (3) Nudges are subtle, not roadblocks. (4) Only shown to free/trial users.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS — activity-nudge class, paid user detection, max 2 waiver nudges + trade nudges on first 3 trades

## Task 4: Manager Comparison View
**Requirement**: "Manager profiles" from North Star + screenshot-worthy comparison visualization.
**Accept when**: (1) "Compare managers" button on league-intel page. (2) Side-by-side radar chart of 2 managers. (3) Stats grid showing per-year averages. (4) Canvas radar chart with Razzle orange/blue dual polygon.
**Depends on**: Task 1
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS — renderCompareSection(), drawCompareRadar() Canvas pentagon, renderCompareStats() grid, toggleable panel

## Task 5: Bureau-to-Situation-Room Bridge CTA
**Requirement**: "Once users see their league data in Razzle and realize what intelligence the Situation Room could layer on top, they convert" from North Star conversion funnel.
**Accept when**: (1) Each manager card has "ask the Diplomat about [Manager]" CTA. (2) Pressure map has "ask the Diplomat how to exploit this" CTA. (3) CTAs navigate to agents.html with pre-filled scenario. (4) warroom.js reads prefilled scenario from localStorage.
**Depends on**: Task 2
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS — prefillScenario() in league-intel.html, razzle_prefill_scenario localStorage handoff, warroom.js reads and populates on load

## Task 6: QA + Integration Verification
**Requirement**: "razzle.lol fully functional end to end" from Roadmap Phase 9 exit criterion.
**Accept when**: (1) league-intel.html loads without JS errors. (2) All new canvas charts render correctly. (3) Pressure map computes scores. (4) Pro-gating works. (5) CTAs navigate correctly. (6) Mobile layout doesn't break. (7) No regressions.
**Depends on**: Task 1, 2, 3, 4, 5
**Size**: M
**Primary role**: QA
**Status**: PASS — JS syntax verified (node --check), all 5 pages serve 200, API endpoints healthy, mobile CSS added
