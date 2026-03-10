# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 8 (QA + UX Audit for Phase 7) — COMPLETE
- All 3 tasks PASS
- Stage: PHASE GATE
- Next: Generate Phase 9 or consume ticket

## Phase 8: QA + UX Audit for Phase 7 (Lab Polish)
**Exit Criterion**: All Phase 7 features verified working — sidebar collapse/expand, breadcrumbs, mobile responsiveness, performance. No regressions in existing Lab functionality.

### Task 1: Verify sidebar collapse/expand and breadcrumbs
**Requirement**: Test sidebar collapse at desktop width: icons visible, tooltips on hover, localStorage persistence. Breadcrumbs show correct category path. Flavor text renders in Caveat font. No duplicate headers.
**Accept when**: Collapse/expand smooth. Icons render. Tooltips appear. Breadcrumbs correct for 5+ panels.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1
**Fixes**: Added base `.sidebar-tooltip { display: none }` rule (was visible in expanded state). Fixed duplicate category icon (Trends used same as Performance).

### Task 2: Verify mobile responsiveness
**Requirement**: Audit CSS for sticky first columns, panel content overflow, drawer sidebar. Verify no conflicting rules.
**Accept when**: CSS audit clean. No conflicting sticky/overflow rules.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Fixes**: Removed `display: block` on tables (broke sticky columns). Changed `.lp-page` to `overflow-x: auto` instead. Resolved conflicting overflow-x rules.

### Task 3: Verify performance optimizations
**Requirement**: Check defer scripts don't break load order. Verify percentile binary search produces correct results. Confirm panel cache invalidation works.
**Accept when**: Scripts load correctly with defer. Percentile computation verified. Cache invalidation tested.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

---

## Phase 7: Lab Polish — transitions, keyboard nav, virtual scrolling, UX refinements
**Exit Criterion**: The Lab feels fast, fluid, and professional. Panel transitions are smooth. Keyboard users can navigate the full sidebar and table. Tables with 500+ rows don't lag. The experience is screenshot-worthy.

### Task 1: Panel transition animations
**Requirement**: CSS fade transitions on panel switch.
**Accept when**: Panel switches feel smooth with fade in/out.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 2: Sidebar keyboard navigation
**Requirement**: Arrow keys, Enter, Home/End, Escape, focus ring, ARIA labels.
**Accept when**: Full sidebar keyboard nav works. Focus ring visible.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 3: Table keyboard navigation
**Requirement**: Arrow keys, Enter for profile, tabindex on rows and headers.
**Accept when**: Keyboard-only table navigation works.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 4: Virtual scrolling for large tables
**Requirement**: Only render visible rows + 20-row buffer. 36px fixed row height. rAF scroll handler.
**Accept when**: Large tables scroll smoothly. DOM has <100 rows at a time.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 5: Sidebar collapse/expand polish
**Requirement**: Sidebar collapse animation: width transitions from 260px to 48px over 200ms ease. Collapsed state shows category icons only (text emoji). Tooltip on hover shows full item name. Expand on hover (optional, behind localStorage pref). Collapse state persisted in localStorage. Main content area adjusts margin smoothly.
**Accept when**: Collapse/expand is smooth. Icons visible in collapsed state. Tooltips work. Preference persists.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 6: Breadcrumb and panel header polish
**Requirement**: Every panel shows a header with: breadcrumb ("The Lab > Rankings & Values > Dynasty Rankings"), panel title in display font, and a subtitle in Caveat with contextual flavor text. Season/position filters appear inline in the header where applicable.
**Accept when**: Every panel has a styled header with breadcrumb, title, and flavor text.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 7: Mobile responsiveness audit
**Requirement**: Test Lab on 375px, 390px, and 768px viewports. Sidebar becomes a slide-out drawer with hamburger toggle. Tables scroll horizontally with sticky first column. Toolbar wraps gracefully. No horizontal overflow on body.
**Accept when**: Lab is fully usable on all 3 viewport sizes. No horizontal body scroll.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 8: Performance audit and optimization
**Requirement**: Profile Lab page load time. Fix: unnecessary API calls on init, render-blocking JS, unoptimized DOM operations, duplicate event listeners, memory leaks from panel switches. Target: <2s initial load, <500ms panel switch (cached).
**Accept when**: Initial load <2s on broadband. Cached panel switch <500ms. No memory leaks.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

---

## Phase 6: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from Phase 5 QA+UX audit are resolved. No panels silently serve NFL data in college mode. NFL-only message has a clickable switch button. DB connection leak fixed.

### Task 1: Add showNflOnlyMsg guards to unguarded panels
**Requirement**: Add `showNflOnlyMsg()` guards to panels that silently serve NFL data in college mode.
**Accept when**: All unguarded panels show NFL-only message when college is toggled. NFL mode still works.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 2: Add clickable "Switch to NFL" button in NFL-only messages
**Requirement**: Update `showNflOnlyMsg()` to include a styled button that calls `setUniverse('nfl')`.
**Accept when**: NFL-only message has a clickable button. Clicking it switches to NFL mode.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 3: Fix DB connection leak in fetch_college_player_profile
**Requirement**: Wrap in try/finally. Fix name matching with two-pass normalization.
**Accept when**: Function uses try/finally. Name matching handles apostrophes/hyphens.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 4: Fix college season defaults and YoY panel duplication
**Requirement**: Change college season defaults to 2025. YoY already guarded in Task 1.
**Accept when**: College panels default to 2025.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 5: Add sidebar visual indicators for NFL-only panels in college mode
**Requirement**: Dim NFL-only sidebar items in college mode.
**Accept when**: NFL-only sidebar items dimmed in college mode. Undimmed in NFL.
**Depends on**: Task 1
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 6: Fix MEDIUM findings (grouped)
**Requirement**: Fix empty-state, LIMIT, render.yaml chain, targetpremium guard.
**Accept when**: All fixes applied. No regressions.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

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
