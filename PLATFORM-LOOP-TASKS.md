# Platform Loop — Phase 139 Task List

## Status
Current Phase: 139 (Saved Views Cloud Sync + Auth UX Polish)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 3/3
Loop Iterations: 3

---

## Task 1: Saved Views Cloud Sync (Pro+ Retention)
**Requirement**: "Cloud sync (formulas, watchlists, saved views)" (Roadmap Phase 9) + "Saved formulas, saved views, agent history — all tied to account." (North Star, Retention)
**Accept when**: Backend has endpoints for saved views (POST /api/user/views/sync, GET /api/user/views). Frontend syncs saved views to server when a Pro/Elite user saves a view. On Lab load, if logged in as Pro+, views are fetched from server and merged with localStorage. A cloud-synced badge appears in the saved views panel for paid users. Free users see upgrade hint.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND + FRONTEND
**Status**: PASS

## Task 2: Auth-Triggered Feature Unlock Refresh
**Requirement**: When a user signs in or completes checkout, all tier-gated features should immediately reflect their plan without requiring a page reload.
**Accept when**: After successful login or Stripe checkout return, the app broadcasts a "plan-changed" event. All gated UI updates: season selector unlocks all seasons, formula limit removed, compare mode limit raised, CSV export enabled, agent query counter updated, Situation Room upsell hidden, Bureau multi-season unlocked. No page reload required.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Nav Auth State Polish
**Requirement**: "Razzle Pro/Elite badge in nav" + "Sign In / Account" button state
**Accept when**: When user is logged in, nav shows their email/username (truncated), plan badge (Pro/Elite in orange, or Free in ink-light), and a dropdown with "Account", "Billing", "Sign Out". When not logged in, shows "Sign In" button. Account dropdown has Razzle styling (chunky border, shadow). Plan badge matches pricing section styling.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS
