# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 12 (Panel Export & Shareability) — COMPLETE
- All 5 tasks PASS
- Stage: PHASE GATE
- Next: Generate Phase 13 or consume ticket

## Phase 12: Panel Export & Shareability
**Exit Criterion**: Every table-based Lab panel has a CSV export button and a panel screenshot button. Users can favorite panels for quick access. Each panel has a brief methodology tooltip explaining how its data is calculated. A r/DynastyFF user can find a panel, understand it, screenshot it, and share it in under 60 seconds.

### Task 1: CSV export button for all table-based panels
**Status**: PASS
**Attempts**: 1
**Notes**: exportPanelCSV() extracts thead/tbody from panel table, generates CSV, triggers download. btn-panel-action styled with 2px chunky border + hover lift. Toast feedback.

### Task 2: Panel screenshot button (PNG with watermark)
**Status**: PASS
**Attempts**: 1
**Notes**: screenshotPanel() uses html2canvas (CDN, same as existing pages). Captures panel content at 2x scale, adds "razzle.lol" watermark via Canvas API, downloads PNG.

### Task 3: Favorite panels with star icon in sidebar
**Status**: PASS
**Attempts**: 1
**Notes**: Star icon (☆/★) injected on each sidebar item via JS. Favorites section above Recent. localStorage razzle_favorite_panels. Max 10. Hidden in collapsed sidebar.

### Task 4: Panel methodology tooltips
**Status**: PASS
**Attempts**: 1
**Notes**: ⓘ info button on every panel. 10 specific methodology texts (VORP, stocks, reportcard, tdregression, airyards, snapefficiency, breakouts, dualthreat, targetpremium, consistency). Generic fallback for others. Caveat font, dashed border, warm bg.

### Task 5: Share URL button with copy-to-clipboard
**Status**: PASS
**Attempts**: 1
**Notes**: sharePanelURL() builds URL with panel, universe, season, pos params. Clipboard API with execCommand fallback. Toast "link copied — share it on Reddit".

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
