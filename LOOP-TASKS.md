# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 5 (College Football Integration)
- Task: Wire college toggle into Performance panels
- Stage: PLAN
- Attempt: 1/3
- Tasks Done: 3/8

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
**Status**: PENDING
**Attempts**: 0

### Task 5: Wire college toggle into Trends & Game Analysis panels
**Requirement**: Usage Trends, YoY, Aging Curves, Leaders, Weekly Leaders panels support college toggle.
**Accept when**: All 5 panels show college data when toggled.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 6: Wire college toggle into Records & History panels
**Requirement**: Records, Season Recap, Awards, Stat Leaders, Explorer support college toggle.
**Accept when**: All 5 panels show college records and history.
**Depends on**: Tasks 1, 2
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 7: Add NFL-only messages for inapplicable panels
**Requirement**: Panels that don't apply to college (Trade Values, Roster Builder, Waivers, Trade Finder, Auction, Cheat Sheet, League Intel, Dashboard, Handcuffs) show a friendly Caveat-font message when college is selected: "NFL only — college players don't have dynasty trade values... yet" (with slight rotation and tiger emoji). The message should feel on-brand, not like an error.
**Accept when**: All NFL-only panels show the message when college is toggled. Message matches Razzle design language.
**Depends on**: Task 1
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 8: College data season expansion verification
**Requirement**: Verify college data covers 2015-present. Run cfbfastr_adapter with `--seasons 2015 2016 2017 2018 2019` if missing. Verify season selector in Lab shows 2015-2025 for college universe. Handle any years where sportsdataverse data is missing gracefully (skip, don't crash).
**Accept when**: College season selector shows 2015-2025. Data loads for all available years. Missing years show empty state, not errors.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

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
