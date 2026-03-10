# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 12 (Panel Export & Shareability)
- All tasks PENDING
- Stage: BUILD
- Next: Execute tasks

## Phase 12: Panel Export & Shareability
**Exit Criterion**: Every table-based Lab panel has a CSV export button and a panel screenshot button. Users can favorite panels for quick access. Each panel has a brief methodology tooltip explaining how its data is calculated. A r/DynastyFF user can find a panel, understand it, screenshot it, and share it in under 60 seconds.

### Task 1: CSV export button for all table-based panels
**Requirement**: Add a "Export CSV" button to the panel header area of every Lab panel that renders a data table. Clicking downloads the current table data as a .csv file (respecting current filters/sort). Button styled as btn-chunky with a download icon. Use a shared helper function that extracts table headers and rows from any panel's DOM table element. File named `razzle_{panel_name}_{date}.csv`.
**Accept when**: At least 3 different panels (test with Rankings, Efficiency, Stock Watch) successfully export their table data as CSV. Button visible and styled per design guide. Empty tables show a toast "no data to export".
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 2: Panel screenshot button (PNG with watermark)
**Requirement**: Add a "Screenshot" button next to the CSV export button on every panel. Clicking captures the panel content area (not sidebar, not header chrome) as a PNG image with the Razzle watermark ("razzle.lol — let's razzle dazzle em baby") baked in at bottom-right. Use html2canvas or a manual Canvas approach. Download as `razzle_{panel_name}_{date}.png`. Sand background color preserved in export.
**Accept when**: Screenshot captures panel content cleanly. Watermark visible. File downloads. Works on panels with tables and panels with canvas charts.
**Depends on**: none
**Size**: L
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 3: Favorite panels with star icon in sidebar
**Requirement**: Add a small star icon (☆/★) next to each panel name in the sidebar. Clicking toggles favorite status (stored in localStorage as array `razzle_favorite_panels`). Favorited panels appear in a "Favorites" section at the very top of the sidebar (above Recent). Section only visible when user has favorites. Star is filled (★) for favorites, outlined (☆) otherwise. Max 10 favorites.
**Accept when**: Star toggle works. Favorites section appears above Recent. Persists across refreshes. Works with sidebar search (favorites always visible when not searching). Sidebar collapsed mode hides Favorites section.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 4: Panel methodology tooltips
**Requirement**: Add an info icon (ⓘ) in each panel's header area (next to the title). Clicking toggles a collapsible methodology section below the title with: (1) a brief explanation of what the panel shows, (2) how the key metric is calculated, (3) data source ("nflverse player stats, 2015-2025"). Use Caveat font for the methodology text (it's a margin note). Start with the 10 most complex panels: VORP, Stock Watch, Report Card, TD Regression, Air Yards, Snap Efficiency, Breakout Candidates, Dual-Threat, Target Premium, Consistency. Other panels can show a generic "Powered by nflverse data" note.
**Accept when**: Info icon visible on all panels. Clicking toggles methodology section. 10 panels have specific methodology text. Section uses Caveat font and feels like a handwritten margin note.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 5: Share URL button with copy-to-clipboard
**Requirement**: Add a "Share" button next to export/screenshot buttons. Clicking copies the current panel URL (with ?panel=name&season=X&pos=Y parameters) to clipboard and shows a brief toast "link copied — share it on Reddit". The URL should encode the current panel, season, position filter, and universe (NFL/College). Ensure the URL restores the exact panel state when opened.
**Accept when**: Share button copies URL. Toast confirms. Opening copied URL in new tab lands on the exact same panel with same filters. Works for at least 3 panels tested.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
**Notes**:

## Phase 11: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from Phases 6-10 QA+UX audit are resolved. Connection leak patched. XSS escaped. localStorage wrapped. Cold grays replaced with warm browns.

### Task 1: Fix CRITICAL — Connection leak in quick_search_players
**Requirement**: Wrap `quick_search_players()` in live_data.py (line 562-584) with try/finally to ensure `conn.close()` is always called. This function powers the Ctrl+K command palette and is called on every keystroke.
**Accept when**: Function has try/finally with conn.close(). No other code paths can leak the connection.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: Wrapped in try/finally with conn.close().

### Task 2: Fix HIGH — XSS via unescaped err.message in lab.js
**Requirement**: Replace `${err.message}` with `${escapeHtml(err.message)}` in all 7 catch blocks in lab.js (lines 2518, 2538, 3275, 4187, 4430, 4805, 8036). Line 8476 already has the correct pattern.
**Accept when**: All err.message interpolations in innerHTML use escapeHtml(). No unescaped error messages remain.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: All 7 instances replaced. grep confirms 0 unescaped err.message in lab.js.

### Task 3: Fix HIGH — Unprotected localStorage in app.js theme functions
**Requirement**: Wrap localStorage calls in `initTheme()` (line 5) and `toggleTheme()` (lines 14, 17) in app.js with try-catch blocks. Phase 10 wrapped lab.js but missed app.js.
**Accept when**: initTheme and toggleTheme don't throw in private browsing. Theme still works normally.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: initTheme body wrapped in try-catch. toggleTheme setItem calls wrapped individually.

### Task 4: Fix HIGH — Cold gray #888 violates design rules
**Requirement**: Replace `#888` with `var(--ink-light)` in lab-panels.css at line 292 (`.tl-tier-label.F`) and line 417 (`.tv-rank.top2`). DESIGN.md forbids cold grays.
**Accept when**: No instances of #888 in lab-panels.css. Warm brown used instead.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1
**Notes**: Both replaced with var(--ink-light). grep confirms 0 instances of #888.

### Task 5: Fix MEDIUM findings (grouped)
**Requirement**: (1) Change badge `border: 1px solid` to `border: 2px solid` for ~16 badge classes in lab-panels.css (lines 559, 596, 797, 982, 1255, 1491, 1699, 1734, 1773, 1810, 1848, 1887, 2149, 2208, 2215, 2415). (2) Move `import re` to module level in live_data.py (add after line 8, remove inline imports at lines 2374 and 4553). (3) Optimize quick_search_players MAX(season) subquery with a CTE.
**Accept when**: Badge borders are 2px. `import re` is at module level only. quick_search uses CTE for MAX(season).
**Depends on**: Task 1 (quick_search already being modified)
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: 16 badge borders changed to 2px. import re moved to module level (2 inline removed). CTE added for MAX(season) in quick_search.

---

## Phase 10: QA + UX Audit — Auto-Generated Fixes — COMPLETE
**Status**: All 5 tasks PASS

## Phase 9: Lab Sidebar Intelligence — COMPLETE
**Status**: All 5 tasks PASS

## Phase 8: QA + UX Audit for Phase 7 — COMPLETE
**Status**: All 3 tasks PASS

## Phase 7: Lab Polish — COMPLETE
**Status**: All 8 tasks PASS

## Phase 6: QA + UX Audit — Auto-Generated Fixes — COMPLETE
**Status**: All 6 tasks PASS

## Phase 5: College Football Integration — COMPLETE
**Status**: All 8 tasks PASS
