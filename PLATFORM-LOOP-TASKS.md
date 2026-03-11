# Platform Loop — Phase 152 Task List

## Status
Current Phase: 152 (Platform: Trial Onboarding + First-Run Experience)
Current Task: COMPLETE
Current Stage: DONE
Attempt: -
Tasks Completed: 4/4
Loop Iterations: 4

---

## Task 1: Post-Registration Trial Welcome
**Requirement**: "The trial-to-paid conversion depends on the user experiencing the value gap between free and Pro within their 7-day window."
**Accept when**: (1) Trial welcome banner in Sleeper prompt. (2) Razzle design system styling. (3) Welcome state with Situation Room CTA after Sleeper connect/skip. (4) Tour CTA button present.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: Trial Expiry Warning Banner
**Requirement**: "Upgrade CTAs feel like invitations, not roadblocks."
**Accept when**: (1) 2-day warning banner. (2) 1-day urgency banner. (3) Expired banner with pricing link. (4) Razzle design styling. (5) Paid/lifetime users excluded.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Trial Feature Highlights in Situation Room
**Requirement**: "See what [Agent Name] thinks about YOUR roster — personalized conversion hooks."
**Accept when**: (1) Trial badge in context mode. (2) Trial pill on briefing cards. (3) Visual treatment is subtle.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 4: QA + Integration Verification
**Requirement**: All onboarding features must work end-to-end without regressions.
**Accept when**: All 8 acceptance checks pass, all backend modules import cleanly, JS syntax balanced.
**Depends on**: Task 1, Task 2, Task 3
**Size**: S
**Primary role**: QA
**Status**: PASS — 8/8 acceptance checks, backend + JS syntax verified
