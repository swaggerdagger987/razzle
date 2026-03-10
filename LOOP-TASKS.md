# Razzle Loop — Phase 45 Task List

> Auto-generated. Completes Roadmap Phase 8: Context Bridge + Free/Paid Gating.

**Current Phase**: 45 — War Room Pro Gating — Free vs Paid Context
**Exit Criterion**: War Room league context injection gated to Pro subscribers only. Free users with Sleeper connected see "League Context: Locked" badge and upgrade CTA. Generic mode forced for free users even if league data exists. Pro users get full context injected. Post-scenario teaser shows free users what they're missing. Response cards show Pro badge when league context was used. Deployed to Render.

---

## Task 1: Gate league context to Pro subscribers only
**Status**: PASS
**Result**: Added `isProUser()` and `hasLeagueData()` helpers. `isLeagueContextMode()` now requires both league data AND Pro subscription. `buildUserMessage()` only injects league context for Pro users. `buildRules()` uses the gated `isLeagueContextMode()`. No league data leaks into free user prompts.
**Acceptance Criteria**:
- `isLeagueContextMode()` checks subscription status (user.plan === "pro")
- Free users with Sleeper connected do NOT get league context injected into prompts
- Pro users with Sleeper connected get full league context injected
- `buildUserMessage()` respects the gating
- No league data leaks into free user prompts

## Task 2: Paywall UX — locked badges, upgrade CTA, post-run teaser
**Status**: PASS
**Result**: Context badge shows "League Context — Pro Only" with lock icon for free users with Sleeper connected. Sleeper badge shows "locked" state. After scenario runs, free users with league data see a teaser card: "your league data is connected but locked" with Upgrade CTA button. Teaser card styled with orange border, sand bg, chunky shadow — matches design system.
**Acceptance Criteria**:
- Context badge shows "League Context: Locked — Pro Only" for free users with Sleeper connected
- Context badge shows "League Context: Active" for Pro users with Sleeper connected
- After free user runs a scenario, a teaser card appears
- Upgrade CTA button in teaser links to checkout flow
- Teaser card matches Razzle design system

## Task 3: Pro indicator on response cards + generic mode hint
**Status**: PASS
**Result**: `renderBriefingCard()` now includes contextPill — "Pro" pill badge (terracotta bg, white text, 9px uppercase) when league context active, or "generic analysis — upgrade for league-specific intel" hint text (handwritten font, faded) when free user has league data. CSS added for `.briefing-pro-pill` and `.briefing-generic-hint`.
**Acceptance Criteria**:
- When league context was used, response cards show a subtle "Pro" pill badge
- When in generic mode, response cards show a hint
- Hint text styled in brand voice
- Visual distinction clear but not obnoxious

## Task 4: Deploy smoke test + commit
**Status**: PASS
**Result**: warroom.js syntax clean. All other JS files clean. Python server imports clean. All gating logic verified: free users get generic mode, Pro users get league context. Badge, teaser, and pill rendering verified.
**Acceptance Criteria**:
- All JS files pass syntax check (node --check)
- All Python files import cleanly
- No broken references or undefined functions
- Free user flow verified
- Pro user flow verified
- Committed and pushed to master

---

## Loop State
```
Current Phase: 45
Current Task: COMPLETE
Current Stage: DONE
Attempt: 1
Tasks Completed: 4/4
```
