# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 6 (QA + UX Audit Fixes)
- Task: Add showNflOnlyMsg guards to 14 unguarded panels
- Stage: PLAN
- Attempt: 1/3
- Tasks Done: 0/6

## Phase 6: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from Phase 5 QA+UX audit are resolved. No panels silently serve NFL data in college mode. NFL-only message has a clickable switch button. DB connection leak fixed.

### Task 1: Add showNflOnlyMsg guards to 14 unguarded panels
**Requirement**: Add `showNflOnlyMsg()` guards to the 14 panels that silently serve NFL data in college mode: buysell, drops, garbagetime, matchups, stacks, redzone, streaks, weeklymvp, playoffs, pace, tdregression, airyards, rankings, tiers. Each panel's render function should check `state.universe === 'college'` and call `showNflOnlyMsg(el, 'panel-specific message')` before returning. Use on-brand messages matching existing style.
**Accept when**: All 14 panels show NFL-only message when college is toggled. NFL mode still works.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 2: Add clickable "Switch to NFL" button in NFL-only messages
**Requirement**: Update `showNflOnlyMsg()` to include a styled button that calls `setUniverse('nfl')`. Button should use chunky border style matching design guide. Also wire the universe bar's button click to clear panel cache so switching back shows correct data.
**Accept when**: NFL-only message has a clickable button. Clicking it switches to NFL mode and reloads the panel with NFL data.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 3: Fix DB connection leak in fetch_college_player_profile
**Requirement**: Wrap `fetch_college_player_profile` body in `try/finally` with `conn.close()` in finally block, matching all other college functions. Also fix name matching to use full normalize logic (strip all non-alpha chars) instead of just stripping spaces.
**Accept when**: Function uses try/finally. Name matching uses same normalization as adapter.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 4: Fix college season defaults and YoY panel duplication
**Requirement**: Change `seasonOptions(awCollege ? 2024 : 2025)` to `seasonOptions(2025)` in all college panel calls (awards, explorer, leaders, recap). Add YoY panel to NFL_ONLY_MESSAGES list since it duplicates Usage Trends in college mode and has no meaningful college-specific behavior.
**Accept when**: College panels default to 2025. YoY panel shows NFL-only message in college mode.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 5: Add sidebar visual indicators for NFL-only panels in college mode
**Requirement**: When college mode is active, dim NFL-only sidebar items (opacity 0.5) and add a small indicator. Create a JS array of NFL-only panel names. In the `applyUniverseUI()` function (or equivalent), iterate sidebar items and toggle a `.sidebar-nfl-only` CSS class. Class adds `opacity: 0.5` and a subtle visual cue.
**Accept when**: NFL-only sidebar items are visually dimmed in college mode. Undimmed when switching back to NFL.
**Depends on**: Task 1 (needs the same list of NFL-only panels)
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 6: Fix MEDIUM findings (grouped)
**Requirement**: Fix the following MEDIUM findings: (a) fetch_college_season_recap: add empty-state return when season_rows is empty. (b) fetch_college_aging_curves: add LIMIT 5000 to the query. (c) render.yaml: change college_adapter.py && to college_adapter.py ; so cfbfastr_adapter still runs if college_adapter fails. (d) Dual-Threat and Target Premium: add to NFL_ONLY_MESSAGES list.
**Accept when**: All 4 MEDIUM fixes applied. No regressions.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

---

## Phase 5: College Football Integration — NFL/College toggle across all panels
**Exit Criterion**: Every applicable Lab panel supports an NFL/College universe toggle. College mode shifts to blue accent. College data covers 2015-present. Panels that don't apply to college show a friendly message.

### Task 1: Add persistent universe toggle to Lab toolbar
**Requirement**: Add an NFL/College toggle button group to the Lab toolbar that persists across panel switches. Store in `state.universe`. When College is active, toolbar background shifts to `var(--blue-light)` per DESIGN.md. Toggle state saved in URL and localStorage.
**Accept when**: Toggle renders, switches state, persists across panel navigation, and visually shifts to blue.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 2: Create college API endpoints for analytical panels
**Requirement**: Add backend endpoints in server.py + live_data.py for college equivalents of key analytics: `/api/college/breakouts`, `/api/college/efficiency`, `/api/college/leaders`, `/api/college/trends`, `/api/college/rankings`, `/api/college/streaks`. Query cfb_player_season_stats and cfb_aggregate_stats tables. Return same response shape as NFL endpoints.
**Accept when**: All college endpoints return valid JSON with real college data. At least 1000+ players per query.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 3: Wire college toggle into Discovery panels
**Requirement**: Breakouts, Stock Watch, Scarcity panels check `state.universe` and call college endpoints when "college" is active. College results show school, conference columns instead of NFL team. Position badges use college-appropriate labels.
**Accept when**: All 3 panels render college data correctly when toggled. NFL data still works.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 4: Wire college toggle into Performance panels
**Requirement**: Efficiency, Consistency, Workload, Dual-Threat, Snap Efficiency panels support college toggle. College stats use per-game and per-play metrics from cfb data.
**Accept when**: All 5 panels show college data when toggled.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 5: Wire college toggle into Trends & Game Analysis panels
**Requirement**: Usage Trends, YoY, Aging Curves, Leaders, Weekly Leaders panels support college toggle.
**Accept when**: All 5 panels show college data when toggled.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 6: Wire college toggle into Records & History panels
**Requirement**: Records, Season Recap, Awards, Stat Leaders, Explorer support college toggle.
**Accept when**: All 5 panels show college records and history.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 7: Add NFL-only messages for inapplicable panels
**Requirement**: Panels that don't apply to college (Trade Values, Roster Builder, Waivers, Trade Finder, Auction, Cheat Sheet, League Intel, Dashboard, Handcuffs) show a friendly Caveat-font message when college is selected: "NFL only — college players don't have dynasty trade values... yet" (with slight rotation and tiger emoji). The message should feel on-brand, not like an error.
**Accept when**: All NFL-only panels show the message when college is toggled. Message matches Razzle design language.
**Depends on**: Task 1
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 8: College data season expansion verification
**Requirement**: Verify college data covers 2015-present. Run cfbfastr_adapter with `--seasons 2015 2016 2017 2018 2019` if missing. Verify season selector in Lab shows 2015-2025 for college universe. Handle any years where sportsdataverse data is missing gracefully (skip, don't crash).
**Accept when**: College season selector shows 2015-2025. Data loads for all available years. Missing years show empty state, not errors.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

---

## Phase 4: Inline Panel Migration — iframe → native render (COMPLETE)
**Exit Criterion**: Every Lab panel renders natively in lab.js with no iframes. Each panel has its own render function that fetches from the API and builds the DOM directly. Panel switching is instant (cached after first load). No page reloads.

### Task 1-10: All PASS (see git history)

---

## Phase 1: Navigation Surgery -- COMPLETE
### Task 1: Slim nav to 4 items on all pages
**Status**: PASS

## Phase 2: The Lab Sidebar -- COMPLETE
### Task 1: Sidebar shell + panel infrastructure
**Status**: PASS
### Task 2: Smart redirects from standalone pages
**Status**: PASS

## Phase 3: Season Expansion -- COMPLETE
### Task 1: Expand data ranges to 2015+
**Status**: PASS
