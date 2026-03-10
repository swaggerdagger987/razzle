# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 10 (QA + UX Audit Fixes for Phases 5-9)
- Stage: BUILD
- Next: Task 1

## Phase 10: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from Phases 5-9 QA+UX audit are resolved. XSS patched. localStorage wrapped. Panel tooltips added. Duplicate naming clarified.

### Task 1: Fix CRITICAL — XSS in recent panels + sidebar init localStorage
**Requirement**: Escape panel name in onclick attribute of `_renderRecentPanels()`. Wrap sidebar collapsed init localStorage read in try-catch. Add aria-label to sidebar search input.
**Accept when**: Recent panel chips use escaped panel names. Sidebar init doesn't throw in private browsing. Search has aria-label.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: escapeHtml(p) in onclick. try-catch on sidebar collapsed init + toggle + search click localStorage. aria-label="Search tools" on input.

### Task 2: Fix HIGH — localStorage try-catch in lab.js and app.js
**Requirement**: Wrap all unprotected localStorage.setItem and getItem calls in lab.js (saveWatchlist, setUniverse, saveCurrentView, deleteSavedView, saveCustomScoringConfigs, toggleHeatColors, saveMyRoster, first-visit hint) and app.js (getAuthHeaders) in try-catch blocks.
**Accept when**: All localStorage operations are wrapped. No uncaught exceptions in private browsing mode.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: Wrapped 10 localStorage calls in lab.js (saveWatchlist, state.universe init, first-visit, setUniverse, heatColors init, saveCurrentView, deleteSavedView, saveCustomScoringConfigs, toggleHeatColors, saveMyRoster). Wrapped getAuthHeaders in app.js. Already-protected calls (loadFormulas, getSavedViews, lab_context) left as-is.

### Task 3: Fix HIGH — Descriptive sidebar tooltips for jargon panels
**Requirement**: Update sidebar tooltip content for panels with jargon names. Instead of repeating the panel name, show a brief description. Target panels: VORP ("Value over replacement player"), Snap Efficiency ("Fantasy points per snap"), Target Premium ("Target quality composite score"), Garbage Time ("Stat padders vs clean producers"), Drop Rate ("Pass drop rates by receiver"), Success Rate ("Positive play rate by player"), TD Regression ("Expected vs actual touchdowns"), Air Yards ("Target depth and air yard share"), Dual-Threat ("Rush + receiving versatility").
**Accept when**: Hovering jargon panel names in collapsed sidebar shows descriptive text, not just the name.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: Updated 11 tooltip texts: VORP, Snap Efficiency, Target Premium, Drop Rate, Garbage Time, Success Rate, TD Regression, Air Yards, Dual-Threat, Stacks, Positional Advantage. Each now shows brief descriptive text instead of repeating the panel name.

### Task 4: Fix HIGH — Rename duplicate/confusing panel names
**Requirement**: Rename "FPTS Breakdown" to "Points Breakdown" in sidebar and PANEL_LABELS. Keep "Scoring Breakdown" (different panel — donut chart). Update sidebar tooltip for both to clarify the difference. Rename "Pace Tracker" to "Player Pace" to distinguish from "Season Pace".
**Accept when**: No near-duplicate panel names. Both renamed panels work correctly. Breadcrumbs and headers updated.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 5: Fix MEDIUM findings (grouped)
**Requirement**: (1) Add one-time first-visit toast: "62 tools in the sidebar. Press ? for shortcuts." with localStorage flag. (2) Increase category chevron size to 14px on mobile (768px breakpoint). (3) Add inline escapeHtml fallback in lab.html before first use.
**Accept when**: First-time visitor sees toast once. Chevrons tappable on mobile. escapeHtml works even if app.js fails.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

---

## Phase 9: Lab Sidebar Intelligence — search, memory, category UX
**Exit Criterion**: The Lab sidebar supports instant text search filtering, remembers the user's last panel across sessions, shows recently viewed panels for quick access, and allows category sections to collapse individually. A power user with 62 panels can find any tool in under 3 seconds.

### Task 1: Sidebar search input
**Requirement**: Add a search input at the top of the sidebar (below the collapse toggle). Typing filters sidebar items in real-time — items that don't match are hidden, matching items stay visible with their category header. Empty search restores all items. Search is case-insensitive and matches partial strings. Collapsed sidebar shows a magnifying glass icon that expands sidebar on click.
**Accept when**: Type "break" → only Breakouts visible. Type "td" → TD Regression visible. Clear → all items back. Works in both expanded and collapsed states.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: Search input at top of sidebar with magnifying glass icon. Filters items + categories by text content and data-panel attribute. Escape clears search. Collapsed mode click expands sidebar and focuses input. CSS `.search-hidden` class for hiding.

### Task 2: Last-visited panel persistence
**Requirement**: Save the current panel name to localStorage on every panel switch. On Lab page load (no ?panel= param), restore the last-visited panel instead of defaulting to screener. If localStorage has no saved panel, default to screener as before. URL param ?panel= still takes priority over localStorage.
**Accept when**: Visit Breakouts panel → close tab → reopen Lab → lands on Breakouts. Visit with ?panel=stocks → lands on Stock Watch (URL overrides). Clear localStorage → defaults to screener.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: Saves `razzle_last_panel` to localStorage on every switchPanel call. On init, checks URL ?panel= first (priority), then falls back to localStorage. No saved panel → screener default.

### Task 3: Recently viewed panels strip
**Requirement**: Add a "Recent" section at the top of the sidebar (below search, above first category). Shows the last 5 unique panels visited as compact clickable chips. Stored in localStorage as ordered array. Updates on every panel switch. Clicking a recent chip switches to that panel. Styled as small pill badges with panel name. Hidden when sidebar is collapsed. Doesn't show the currently active panel in the list.
**Accept when**: Visit 6+ panels → Recent section shows last 5 (excluding current). Click a chip → switches panel. Persists across page refreshes. Chips styled as compact pills matching design guide.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: Recent section with "Recent" label and pill chips. `razzle_recent_panels` localStorage array (max 5+1). Excludes current panel from display. Chips styled with bg-warm, ink-faint border, rounded, hover shows orange-light. Hidden in collapsed sidebar.

### Task 4: Individual category collapse/expand
**Requirement**: Clicking a category header in the sidebar toggles visibility of its items. Collapsed category shows a small chevron (▸) that rotates to (▾) when expanded. All categories start expanded by default. Collapse state saved per-category in localStorage. Category headers remain visible when collapsed — only child items hide. Works with sidebar search (search results override collapse state — matching items always show).
**Accept when**: Click "Performance" header → items hide, chevron rotates. Click again → items show. State persists across refreshes. Search overrides collapse (searching "eff" shows Efficiency even if Performance is collapsed).
**Depends on**: Task 1 (search override logic)
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: JS-injected chevron (▾) on each category header with CSS rotation on collapse. `razzle_cat_collapsed` localStorage object with per-category keys. `.cat-hidden` class on items. Search override: `_overrideCatForSearch()` removes cat-hidden from search-matched items. `_restoreCatCollapseState()` restores on search clear. Chevrons hidden in fully-collapsed sidebar.

### Task 5: Tool count and sidebar polish
**Requirement**: Show a small "62 tools" badge in the sidebar header area (near the collapse toggle). Count is dynamic based on actual sidebar items. Add subtle separator line between Recent section and first category. Ensure search input, recent strip, and category collapse all work together without layout shifts or visual glitches.
**Accept when**: Badge shows correct count. All 3 new features (search, recent, category collapse) work together smoothly. No layout jumps when typing in search. No visual regressions.
**Depends on**: Tasks 1, 3, 4
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: Dynamic "62 tools" badge inline with search input via flex layout. Badge hidden in collapsed sidebar. All features verified: search filters items + overrides category collapse, recent chips update on panel switch, category collapse persists. No layout shifts.

---

## Phase 8: QA + UX Audit for Phase 7 (Lab Polish) — COMPLETE
**Exit Criterion**: All Phase 7 features verified working.

### Task 1: Verify sidebar collapse/expand and breadcrumbs
**Status**: PASS
**Attempts**: 1

### Task 2: Verify mobile responsiveness
**Status**: PASS
**Attempts**: 1

### Task 3: Verify performance optimizations
**Status**: PASS
**Attempts**: 1

---

## Phase 7: Lab Polish — COMPLETE
**Status**: All 8 tasks PASS

---

## Phase 6: QA + UX Audit — Auto-Generated Fixes — COMPLETE
**Status**: All 6 tasks PASS

---

## Phase 5: College Football Integration — COMPLETE
**Status**: All 8 tasks PASS

---

## Phase 4: Inline Panel Migration — COMPLETE
**Status**: All 10 tasks PASS

---

## Phase 1-3: Navigation Surgery, Lab Sidebar, Season Expansion — COMPLETE
