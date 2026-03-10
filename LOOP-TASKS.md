# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 9 (Lab Sidebar Intelligence)
- Stage: BUILD
- Next: Task 1

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
**Status**: PENDING
**Attempts**: 0

### Task 3: Recently viewed panels strip
**Requirement**: Add a "Recent" section at the top of the sidebar (below search, above first category). Shows the last 5 unique panels visited as compact clickable chips. Stored in localStorage as ordered array. Updates on every panel switch. Clicking a recent chip switches to that panel. Styled as small pill badges with panel name. Hidden when sidebar is collapsed. Doesn't show the currently active panel in the list.
**Accept when**: Visit 6+ panels → Recent section shows last 5 (excluding current). Click a chip → switches panel. Persists across page refreshes. Chips styled as compact pills matching design guide.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 4: Individual category collapse/expand
**Requirement**: Clicking a category header in the sidebar toggles visibility of its items. Collapsed category shows a small chevron (▸) that rotates to (▾) when expanded. All categories start expanded by default. Collapse state saved per-category in localStorage. Category headers remain visible when collapsed — only child items hide. Works with sidebar search (search results override collapse state — matching items always show).
**Accept when**: Click "Performance" header → items hide, chevron rotates. Click again → items show. State persists across refreshes. Search overrides collapse (searching "eff" shows Efficiency even if Performance is collapsed).
**Depends on**: Task 1 (search override logic)
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 5: Tool count and sidebar polish
**Requirement**: Show a small "62 tools" badge in the sidebar header area (near the collapse toggle). Count is dynamic based on actual sidebar items. Add subtle separator line between Recent section and first category. Ensure search input, recent strip, and category collapse all work together without layout shifts or visual glitches.
**Accept when**: Badge shows correct count. All 3 new features (search, recent, category collapse) work together smoothly. No layout jumps when typing in search. No visual regressions.
**Depends on**: Tasks 1, 3, 4
**Size**: S
**Status**: PENDING
**Attempts**: 0

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
