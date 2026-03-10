# Razzle — Progress Tracker

## Current Phase: Phase 12 — Panel Export & Shareability (IN PROGRESS)

**Exit Criterion**: Every table-based Lab panel has CSV export and screenshot buttons. Favorite panels. Methodology tooltips. Share URL with copy. A user can find, understand, screenshot, and share a panel in under 60 seconds.

### Phase 12 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CSV export button for all table-based panels | TODO | |
| 2 | Panel screenshot button (PNG with watermark) | TODO | |
| 3 | Favorite panels with star icon in sidebar | TODO | |
| 4 | Panel methodology tooltips | TODO | |
| 5 | Share URL button with copy-to-clipboard | TODO | |

## Previous Phase: Phase 11 — QA + UX Audit Fixes for Phases 6-10 (COMPLETE)

**Exit Criterion MET**: All CRITICAL and HIGH findings from Phases 6-10 QA+UX audit resolved. Connection leak patched. XSS escaped. localStorage wrapped. Cold grays replaced with warm browns.

### Phase 11 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix CRITICAL — Connection leak in quick_search_players | DONE | try/finally with conn.close() |
| 2 | Fix HIGH — XSS via unescaped err.message (7 instances) | DONE | All 7 now use escapeHtml(err.message) |
| 3 | Fix HIGH — Unprotected localStorage in app.js | DONE | initTheme + toggleTheme wrapped |
| 4 | Fix HIGH — Cold gray #888 design violation | DONE | Replaced with var(--ink-light) |
| 5 | Fix MEDIUM findings (badge borders, import re, CTE) | DONE | 16 badges to 2px, re at module level, CTE for MAX(season) |

## Previous Phase: Phase 10 — QA + UX Audit Fixes (COMPLETE)

**Exit Criterion MET**: All CRITICAL and HIGH findings from Phases 5-9 QA+UX audit resolved. XSS patched, localStorage wrapped, jargon tooltips added, duplicate names clarified.

### Phase 10 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix XSS in recent panels + localStorage init + aria-label | DONE | escapeHtml in onclick, try-catch on sidebar init, aria-label on search |
| 2 | localStorage try-catch in lab.js and app.js | DONE | 10 localStorage calls in lab.js + 1 in app.js wrapped |
| 3 | Descriptive sidebar tooltips for jargon panels | DONE | 11 panels now show descriptive text instead of name repetition |
| 4 | Rename duplicate/confusing panel names | DONE | "FPTS Breakdown" → "Points Breakdown", "Pace Tracker" → "Player Pace" |
| 5 | Medium fixes (toast, chevrons, escapeHtml fallback) | DONE | First-visit toast updated, 14px chevrons on mobile, inline escapeHtml fallback |

## Previous Phase: Phase 9 — Lab Sidebar Intelligence (COMPLETE)

**Exit Criterion**: The Lab sidebar supports instant text search filtering, remembers the user's last panel across sessions, shows recently viewed panels for quick access, and allows category sections to collapse individually. A power user with 62 panels can find any tool in under 3 seconds.

### Phase 9 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Sidebar search input | DONE | Search input at top of sidebar with magnifying glass icon. Filters items + categories in real-time. Escape clears. Collapsed mode click expands sidebar. |
| 2 | Last-visited panel persistence | DONE | `razzle_last_panel` in localStorage. Restores on page load (URL param takes priority). |
| 3 | Recently viewed panels strip | DONE | "Recent" section with pill chips below search. Last 5 unique panels (excluding current). Stored in localStorage. Hidden in collapsed mode. |
| 4 | Individual category collapse/expand | DONE | Chevron on category headers. Per-category localStorage persistence. Search overrides collapse state. |
| 5 | Tool count and sidebar polish | DONE | Dynamic "62 tools" badge inline with search. All features work together. No layout shifts. |

## Previous Phase: Phase 8 — QA + UX Audit for Phase 7 (COMPLETE)

**Exit Criterion MET**: All Phase 7 features verified working. Sidebar tooltip visibility fix, mobile table layout fix.

## Previous Phase: Phase 7 — Lab Polish (COMPLETE)

**Exit Criterion**: The Lab feels fast, fluid, and professional. Panel transitions are smooth. Keyboard users can navigate the full sidebar and table. Tables with 500+ rows don't lag. The experience is screenshot-worthy.

### Phase 7 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Panel transition animations | DONE | CSS opacity transitions 150ms. Fade-out on current, fade-in on new via rAF double-buffer. |
| 2 | Sidebar keyboard navigation | DONE | Arrow Up/Down, Enter/Space, Home/End, Escape. Focus ring, ARIA roles. |
| 3 | Table keyboard navigation | DONE | Arrow Up/Down rows, Enter opens profile, Home/End, header sort via Enter. Focus rings. |
| 4 | Virtual scrolling for large tables | DONE | Pre-computed row HTML + visible-only rendering. 20-row buffer, rAF scroll, 36px rows, spacer rows. |
| 5 | Sidebar collapse/expand polish | DONE | 200ms width transition, 12 category icons, 63 item data-icons with ::before, hover tooltips, localStorage persistence. |
| 6 | Breadcrumb and panel header polish | DONE | Full breadcrumb path (Lab > Category > Panel), display-font title, Caveat flavor text for all 62 panels. CSS hides duplicate h2 in panel content. |
| 7 | Mobile responsiveness audit | DONE | Sticky first column on all tables (screener + panels). Panel content overflow containment. 375px/480px/768px breakpoints. Slide-out drawer, hamburger toggle, backdrop close, auto-close on nav already existed. |
| 8 | Performance audit and optimization | DONE | defer on formulas/formula-store/charts scripts. Binary search percentile computation (O(n log n) to O(n log n) but faster inner loop). Column-aware cache key. Panel innerHTML cleanup on universe switch prevents memory leaks. |

## Previous Phase: Phase 6 — QA + UX Audit Fixes (COMPLETE)

**Exit Criterion MET**: All CRITICAL and HIGH findings from Phase 5 QA+UX audit resolved. 16 panels got NFL-only guards. Clickable switch button added. DB connection leak fixed. Sidebar dims NFL-only panels in college mode. Season defaults fixed. MEDIUM findings addressed.

### Phase 6 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Add showNflOnlyMsg guards to 16 unguarded panels | DONE | Guards on rankings, tiers, buysell, targetpremium, drops, garbagetime, matchups, stacks, redzone, streaks, weeklymvp, playoffs, yoy, pace, tdregression, airyards. 18 NFL_ONLY_MESSAGES entries. |
| 2 | Add clickable "Switch to NFL" button in NFL-only messages | DONE | Chunky terracotta button in showNflOnlyMsg(), calls setUniverse('nfl'). |
| 3 | Fix DB connection leak in fetch_college_player_profile | DONE | try/finally wrapper. Two-pass name matching. |
| 4 | Fix college season defaults and YoY panel duplication | DONE | Changed 4 panels from 2024 to 2025 default. |
| 5 | Add sidebar visual indicators for NFL-only panels | DONE | .sidebar-nfl-only class: opacity 0.4 (0.7 on hover). |
| 6 | Fix MEDIUM findings (grouped) | DONE | season_recap empty-state, aging_curves subquery, render.yaml ;. |

## Previous Phase: Phase 5 — College Football Integration (COMPLETE)

**Exit Criterion MET**: Every applicable Lab panel supports an NFL/College universe toggle. College mode shifts to blue accent. College data covers 2015-2025 (31,039 player-season rows). Panels that don't apply to college show a friendly message.

### Phase 5 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Add persistent universe toggle to Lab toolbar | DONE | Extracted NFL/Prospects/College toggle from screener toolbar into persistent universe-bar above all panels. Blue accent shift via body.college-mode/.prospect-mode CSS classes. localStorage + URL param persistence. Panel cache invalidation on universe change. |
| 2 | Create college API endpoints for analytical panels | DONE | 6 endpoints: /api/college/{breakouts,efficiency,leaders,trends,rankings,streaks}. Query cfb_player_season_stats. 3700+ qualifying players per season. Approximate fantasy points for college (0.1 yd, 6 TD, 1 rec PPR, 0.04 pass yd, 4 pass TD). Breakouts use opportunity-production gap within position groups. Efficiency uses PPO with A+-F grades. Leaders has 12 categories including derived stats. Trends shows YoY risers/fallers. Rankings has tier labels (Elite/Star/Starter/Contributor/Depth/Roster). Streaks shows multi-season momentum. |
| 3 | Wire college toggle into Discovery panels | DONE | Breakouts, Stock Watch, Scarcity panels now check state.universe. College mode calls /api/college/breakouts, /api/college/stock-watch, /api/college/scarcity. New backend: fetch_college_stock_watch (efficiency-vs-production gap, PPO+YPT+PPG percentiles, rising/falling split) and fetch_college_scarcity (PPG drop-off by position with college-specific tier breaks). Frontend shows school+conference, college-appropriate stat labels (BKO score, YD/G, TD/G), dynamic titles/subtitles. Season selector repopulates on universe change. |
| 4 | Wire college toggle into Performance panels | DONE | 4 new college endpoints: /api/college/consistency (cross-season PPG variance, multi-year CoV grades), /api/college/workload (touches/game, carries/targets, no snap data), /api/college/dual-threat (geometric mean rush+rec), /api/college/snap-efficiency (touch efficiency, pts/touch). 5 frontend panels (Efficiency, Consistency, Snap Efficiency, Workload, Dual-Threat) check state.universe. College shows school+conference, adapted labels (Pts/Touch instead of Pts/Snap), hides snap columns when unavailable. Season selectors repopulate on universe change. |
| 5 | Wire college toggle into Trends & Game Analysis panels | DONE | 5 panels wired: Usage Trends (college/trends as production risers/fallers, hides weeks selector), Year-over-Year (college/trends with prev/curr YPG columns, delta, TD/G chips), Aging Curves (new /api/college/aging-curves endpoint, production by experience year 1-6, "Yr 1" labels), Stat Leaders (college/leaders with school+conference, adapted field names), Weekly Leaders (friendly Caveat-font message explaining college is season-level, directs to Stat Leaders). Season selectors and metric dropdowns conditionally hidden for college. |
| 6 | Wire college toggle into Records & History panels | DONE | 4 new college endpoints: /api/college/records (single-season fpts/yards/TDs, career fpts/yards), /api/college/season-recap (MVP, pos leaders, top yards/TDs, breakouts/busts), /api/college/season-awards (8 awards: MVP, Most Efficient, Iron Man, Volume King, Breakout Star, TD King, Yardage Machine, PPG Leader), /api/college/stat-explorer (15 college metrics scatter plot). 4 frontend panels (Records, Season Recap, Awards, Explorer) check state.universe. College shows school+conference, adapted sections (no single-game records, college-specific categories). Stat Leaders already wired in Task 5. Season selectors repopulate on universe change. Awards buildAwardCard handles college (no headshots, shows TDs/PPO/Games badges). Explorer uses college metric set (total_ypg, rush/rec/pass_ypg, yards_per_carry, etc.). |
| 7 | Add NFL-only messages for inapplicable panels | DONE | 8 panels (Trade Values, Auction, Cheat Sheet, Waivers, Handcuffs, Dashboard, Roster Builder, Trade Finder) show Caveat-font friendly message with football emoji when college is toggled. Shared `showNflOnlyMsg()` helper with per-panel unique messages. CSS `.lp-nfl-only` class with slight rotation. Message clears when switching back to NFL via `_invalidatePanelCaches`. League Intel is standalone page, not a Lab panel — skipped. |
| 8 | College data season expansion verification | DONE | Fetched 2015-2019 college data via cfbfastr_adapter (11,585 new player-season rows). DB now has 31,039 total cfb rows across 2015-2025. Extended seasonOptions() in lab-panels.js from 2018→2015. Updated render.yaml build command to fetch 2015-2025 for both NFL and college. College filter-options endpoint dynamically queries available seasons — auto-discovers 2015-2025. All cross-season queries (trends, aging curves) work with expanded data. |

## Previous Phase: Consolidation — Inline Panel Migration (COMPLETE)

All 62 iframe panels migrated to native render functions. Zero iframes remain. Panel switching is instant for cached panels.

### Consolidation Phase 5: Inline Panel Migration
#### Task 10: Remove iframe fallbacks and clean up (DONE)
Removed all iframe infrastructure from lab.html: `panel-iframe` container div, `<iframe>` element, `loadedFrames` variable, `PANEL_URLS` map, `isPanelNative()` function, and the entire iframe fallback `else` branch in `switchPanel()`. Cleaned 62 sidebar `onclick` attributes to remove URL params (e.g. `switchPanel('rankings','/rankings.html')` → `switchPanel('rankings')`). Updated stale comments. Zero iframes remain in lab.html. All 62 native panels verified against sidebar entries. JS syntax validated.

#### Task 9: Migrate remaining panels (DONE)
Converted 17 remaining iframe panels to native render: Awards, Dashboard, Draft Class Analytics, Explorer, Stat Leaders, Opportunity Share, Percentiles, Prospects/Big Board, Season Recap, Records, Roster Builder, Schedule/SOS, Scoring Comparison, Success Rate, Target Distribution, Team Rosters, Trade Finder. Appended to `lab-panels.js` (~2474 lines added, total 8507 lines) and `lab-panels.css` (~489 lines added, total 3505 lines). Draft Class: canvas bar chart with DPR-aware rendering, summary chips. Explorer: canvas scatter plot with 17 configurable metrics, trendline, click tooltip. Roster Builder: search+add players, POST /api/roster-grade, dynamic grade card. Trade Finder: player search with 3 target sections (equal/buy-low/sell-high), value diff chips. Opportunity: dual sortable tables (alpha dogs + dominator leaders). Schedule: dual sortable tables (suppressed + inflated). Dashboard: 5-section overview (top5, risers, fallers, value picks, scarcity). All panels use scoped `el.querySelector()` with unique prefixes (aw2-, db2-, dc2-, exp-, ld2-, opp2-, pct2-, bb-, rc2-, rec-, rbld-, sos2-, sc2-, sr2-, td2-, tm-, tf2-). Total native panels: 62. Zero iframes remaining to migrate.

#### Task 8: Migrate Player Tools panels (DONE)
Converted 9 iframe panels to native render: Career Stats, Career Compare, Compare Table, Strengths, Report Card, FPTS Breakdown, Game Log, Archetypes, Scoring Breakdown. Appended to `lab-panels.js` (~1322 lines added, total 6033 lines) and `lab-panels.css` (~363 lines added, total 3016 lines). Added shared helpers: `buildPlayerSearch()` for reusable autocomplete with scoped DOM queries, `searchWrapHTML()`, `seasonOptions()`, `posTabsHTML()`. Career Stats: player search → canvas PPG trajectory chart + season stat table. Career Compare: 3 player slots with overlay canvas chart. Compare Table: 2-8 player sortable stat grid. Strengths: percentile bars with grade badges. Report Card: two-section honor roll/needs improvement with GPA grades and per-metric grade badges. FPTS Breakdown: stacked horizontal bars by scoring category. Game Log: week-by-week sortable table. Archetypes: archetype card grid with icons and player chips. Scoring Breakdown: donut chart canvas with category percentages. All panels use scoped `el.querySelector()` with unique prefixes (cst-, ccp-, cmt-, sw2-, rpc-, fpb-, glo-, arc-, pbd-). Total native panels: 45.

#### Task 7: Migrate Trends & Projections panels (DONE)
Converted 7 iframe panels to native render: Usage Trends, Year-over-Year, Aging Curves, Pace Tracker, Season Pace, TD Regression, Air Yards. Appended to `lab-panels.js` (~915 lines added, total 4711 lines) and `lab-panels.css` (~189 lines added, total 2653 lines). Usage Trends: risers/fallers tables with canvas sparklines (80x24px), window selector (3/5/8 weeks). Year-over-Year: dual season selectors, metric dropdown, delta badges with mini-chips. Aging Curves: canvas PPG-by-age line chart with area fill, peak age marker, summary cards. Pace Tracker: responsive player card grid with milestone progress bars, on-pace/off-pace badges. Season Pace: milestone watch table with gold/silver badges. TD Regression: rate chips + two-column buy/sell grid with diff bars. Air Yards: two sortable sections (buy_low/sell_high) with 12-column tables, regression badges, column tooltips. Total native panels: 36.

#### Task 6: Migrate Game Analysis panels (DONE)
Converted 8 iframe panels to native render: Weekly Heatmap, Matchups, Stacks, Red Zone, Streaks, Weekly Leaders, Weekly MVP Grid, Playoffs. Appended to `lab-panels.js` (~1175 lines added) and `lab-panels.css` (~540 lines added). Weekly Heatmap: player×week heat grid with 5-tier colors, sortable columns, sticky player col. Matchups: 32-team defense grid with percentile heat colors, detail panel on cell click. Stacks: QB+WR/TE correlation table with corr badges. Red Zone: two-section sortable (dominators+td_dependent) with GL rate badges. Streaks: two-column hot/cold with sparkline bars. Weekly Leaders: sortable table with week nav, rank medals. Weekly MVP: position×week grid. Playoffs: matchup grade table (wk 14-17).

#### Task 1: Audit current iframe panels (DONE)
Cataloged all 62 iframe panels across 10 categories with source files, API endpoints, and render complexity (8 S, 45 M, 9 L). Full audit in LOOP-TASKS.md.

#### Task 2: Create panel render infrastructure (DONE)
Built panel registry system in lab.html inline script. `registerPanel(name, renderFn)` registers native render functions. `switchPanel(name)` checks registry first — native panels get a `<section>` container created on first access with lazy-load rendering; unregistered panels fall back to iframe. Screener registered as first native panel. Added `reloadPanel(name)` for re-rendering and `isPanelNative(name)` for checking. URL state (`?panel=name`), browser back/forward, sidebar active state, breadcrumb headers all work. PANEL_URLS map extracted from sidebar onclick attributes for iframe fallback without explicit URL param. 47/47 braces balanced, 122/122 parens balanced.

#### Task 5: Migrate Performance panels (DONE)
Converted 8 iframe panels to native render: Efficiency, Consistency, Snap Efficiency, Workload Monitor, Dual-Threat, Target Premium, Drop Rate, Garbage Time. Appended to `lab-panels.js` (~970 lines added) and `lab-panels.css` (~400 lines added). Efficiency/Consistency: two-section sortable tables (efficient+volume, rock_solid+wild_cards) with grade badges. Snap Efficiency/Workload/Dual-Threat/Target Premium: single card tables with pos tabs, season select, metric badges. Drop Rate/Garbage Time: two-section grids with rate badges and pct badges. All panels responsive at 768px/480px.

#### Task 4: Migrate Discovery panels (DONE)
Converted 6 iframe panels to native render: Breakouts, Buy/Sell, Stock Watch, Waivers, Scarcity, Handcuffs. Appended to `lab-panels.js` (~730 lines added) and `lab-panels.css` (~820 lines added). Breakouts: card grid with RBS scores, opportunity/production bars. Buy/Sell: two-column buy-low/sell-high cards with efficiency grades. Stock Watch: sortable rising/falling tables with composite score badges. Waivers: table with sparkline bars, window selector. Scarcity: summary cards + per-position bar charts with tier breaks. Handcuffs: team-based table with starter/backup comparisons.

#### Task 3: Migrate Rankings & Values panels (DONE)
Converted 7 iframe panels to native render: Dynasty Rankings, Tiers, Trade Values, VORP, Positional Advantage, Auction Values, Cheat Sheet. Created `lab-panels.js` (~900 lines) with self-contained render functions pushed via `window._labPanelDefs` deferred registration pattern. Created `lab-panels.css` (704 lines) with shared `.lp-*` prefix classes and panel-specific styles. All panels support position filter tabs, season selectors, sorting, and responsive breakpoints. Wired into lab.html with CSS link, script tag, and registry consumption block.

### Previous Consolidation Phases (COMPLETE)

#### Phase 1: Navigation Surgery
Replaced 67-link mega-nav with clean 4-item nav on all 72 HTML pages.

#### Phase 2: Lab Sidebar
Added collapsible left sidebar to lab.html with all 60+ tools in 10 categories. Iframe panel switching, URL state, mobile drawer.

#### Phase 3: Smart Redirects
63 standalone pages redirect to lab.html?panel=X when loaded directly.

#### Phase 4: Season Expansion
Expanded data range to 2015-present for NFL and college.

### Decisions Log
- **Iframe vs Inline panels**: Using iframe loading as initial approach for all 60+ panels. This gets the UX right immediately (sidebar + panel switching + URL state) while content can be gradually inlined. The redirect script uses `window.self===window.top` to only fire on direct access, not iframe loading.
- **Sidebar width**: 240px (slightly narrower than spec's 260px) to give more space to main content. Collapses to 48px.
- **Mobile approach**: Sidebar becomes a slide-out drawer triggered by hamburger button. Closes on panel selection or outside click.

## Previous Phase: Phase 142 — Success Rate Dashboard (COMPLETE)

**Exit criterion MET:** /successrate.html ranks players by rush/pass success rate from PBP data. Success rate % badges (high/mid/low), type chip (rush/pass), volume, PPG, YPC, bar visualization. Position filter tabs, season selector, PNG export with watermark. GET /api/success-rate returns data. 10 escapeHtml calls, 25/25 braces balanced. "Success Rate" nav link on all 71 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 142 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_success_rate, rush/pass SR, 10 escapeHtml, 71/71 nav |

## Previous Phase: Phase 141 — Drop Rate Dashboard (COMPLETE)

**Exit criterion MET:** /drops.html ranks pass catchers by drop rate — sure hands (drop rate <= 8%) vs butterfingers (drop rate >= 15%). Drop rate % badges, drops count, targets, catch rate, YAC per reception, bar visualization. WR/TE/RB position filter tabs, season selector, PNG export with watermark. GET /api/drop-rate returns data. 10 escapeHtml calls, 27/27 braces balanced. "Drops" nav link on all 70 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 141 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_drop_rate, sure_hands/butterfingers split, 10 escapeHtml, 70/70 nav |

## Previous Phase: Phase 140 — QA+UX Audit for Phases 136-139 (COMPLETE)

**Exit criterion MET:** QA+UX audit of Garbage Time (136), Season Pace (137), Target Premium (138), Workload Monitor (139). 1 HIGH finding: redundant `import math` inside loop in fetch_dual_threat (Phase 133) — fixed. All 4 pages pass XSS, error handling, loading states, PNG export, analytics, design compliance checks.

## Previous Phase: Phase 139 — Workload Monitor (COMPLETE)

**Exit criterion MET:** /workload.html ranks players by workload score (touches/g weighted + snaps/g + snap%). Workload score badges (high/mid/low), usage flags (bell cow, extreme volume, snap hog, target monster, iron man), touches/g, snaps/g, snap%, carries/g, targets/g, bar visualization. Position filter tabs, season selector, PNG export with watermark. GET /api/workload-monitor returns data. 12 escapeHtml calls, 59/59 braces balanced. "Workload" nav link on all 69 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 139 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_workload_monitor, usage flags, 12 escapeHtml, 69/69 nav |

## Previous Phase: Phase 138 — Target Premium (COMPLETE)

**Exit criterion MET:** /targetpremium.html ranks pass catchers by target quality composite (30% Y/Tgt + 25% catch rate + 25% YAC/rec + 20% aDOT percentiles). Premium score badges (elite/high/mid/low), aDOT, catch rate, YAC per reception, yards per target, targets per game, bar visualization. WR/TE/RB filter tabs, season selector, PNG export with watermark. GET /api/target-premium returns data. 11 escapeHtml calls, 59/59 braces balanced. "Target Premium" nav link on all 68 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 138 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_target_premium, percentile composite, 11 escapeHtml, 68/68 nav |

## Previous Phase: Phase 137 — Season Pace Tracker (COMPLETE)

**Exit criterion MET:** /seasonpace.html projects season totals based on per-game pace and tracks milestone seasons. Shows players on pace for 1000/1500 yard, 4000/5000 pass yard, 10/30/40 TD, 100 rec, 500 rush yd (QB) milestones. Gold badges for elite milestones, silver for standard. Sorted by milestone count then PPG. Position filter tabs, season selector, PNG export with watermark. GET /api/season-pace returns data. 8 escapeHtml calls, 54/54 braces balanced. "Pace" nav link on all 67 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 137 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_season_pace, milestone badges, 8 escapeHtml, 67/67 nav |

## Previous Phase: Phase 136 — Garbage Time Detector (COMPLETE)

**Exit criterion MET:** /garbagetime.html identifies stat padders (high garbage time %) vs clean producers (low garbage time % + solid PPG). GT% badges, avg score differential, bar visualization. Position filter tabs, season selector, PNG export with watermark. GET /api/garbage-time returns data. 12 escapeHtml calls, 65/65 braces balanced. "Garbage Time" nav link on all 66 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 136 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_garbage_time, padders/clean split, 12 escapeHtml, 66/66 nav |

## Previous Phase: Phase 135 — QA+UX Audit for Phases 131-134 (COMPLETE)

**Exit criterion MET:** QA+UX audit of Positional Advantage (131), TD Regression (132), Dual-Threat Index (133), Snap Efficiency (134). 0 findings — clean audit. All 4 pages pass XSS, error handling, loading states, PNG export, analytics, design compliance, responsive design, URL state, backend data quality checks.

## Previous Phase: Phase 134 — Snap Efficiency Dashboard (COMPLETE)

**Exit criterion MET:** /snapefficiency.html ranks players by fantasy points per snap played. Efficiency badges (elite/high/mid/low) by pts_per_snap thresholds, bar visualization, PPG, snaps per game, total snaps, games played. Position filter tabs, season selector, PNG export with watermark. GET /api/snap-efficiency returns data. 10 escapeHtml calls, 59/59 braces balanced. "Snap Eff" nav link on all 65 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 134 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_snap_efficiency, PPR per snap, 10 escapeHtml, 65/65 nav |

## Previous Phase: Phase 133 — Dual-Threat Index (COMPLETE)

**Exit criterion MET:** /dualthreat.html ranks players by rush+rec versatility using geometric mean of rushing and receiving yards per game (rewards balanced production over one-dimensional volume). DTI score badges (elite/high/mid/low), rush/rec split bar visualization, yards per game breakdown, carries and receptions per game. Position filter tabs, season selector, PNG export with watermark. GET /api/dual-threat returns data. 11 escapeHtml calls, 61/61 braces balanced. "Dual-Threat" nav link on all 64 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 133 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_dual_threat, geometric mean DTI, split bars, 11 escapeHtml, 64/64 nav |

## Previous Phase: Phase 132 — TD Regression Candidates (COMPLETE)

**Exit criterion MET:** /tdregression.html shows TD regression candidates — expected vs actual TDs based on positional avg TD rate and opportunity volume. Buy low section (positive regression: actual TDs below expected) and sell high section (negative regression: actual TDs above expected). TD diff badges, TD rate %, opportunity count, bar visualization. Positional avg TD rate chips. Position filter tabs, season selector, PNG export with watermark. GET /api/td-regression returns data. 17 escapeHtml calls, 68/68 braces balanced. "TD Regression" nav link on all 63 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 132 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_td_regression, buy/sell sections, 17 escapeHtml, 63/63 nav |

## Previous Phase: Phase 131 — Positional Advantage (COMPLETE)

**Exit criterion MET:** /advantage.html shows players who provide the biggest scoring advantage over the positional average PPG. Unlike VORP (vs replacement level), this shows value above the full positional average. Edge badges color-coded by magnitude (elite/strong/solid/modest/below avg), bar visualization, positional average chips at top. Position filter tabs, season selector, PNG export with watermark. GET /api/positional-advantage returns data. 12 escapeHtml calls, 65/65 braces balanced. "Advantage" nav link on all 62 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 131 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend + frontend + nav + smoke test | DONE | fetch_positional_advantage, edge badges, bar viz, 12 escapeHtml, 62/62 nav |

## Previous Phase: Phase 130 — QA+UX Audit for Phases 126-129 (COMPLETE)

**Exit criterion MET:** QA+UX audit of FPTS Breakdown (126), Handcuff Rankings (127), Weekly MVP Grid (128), Stack Correlation Finder (129). 1 HIGH finding: `get_db()` → `get_conn()` in 12 backend functions from Phases 116-129. All 12 occurrences fixed. All 4 pages pass XSS, error handling, loading states, PNG export, analytics, design compliance. No other issues found.

## Previous Phase: Phase 129 — Stack Correlation Finder (COMPLETE)

**Exit criterion MET:** /stacks.html shows QB-WR/TE stacking correlations. Computes Pearson correlation between QB weekly scores and their same-team pass catchers. Ranked by correlation strength with color-coded badges (high/mid/low/negative), correlation bar visualization, combined PPG, common games count. Season selector, PNG export with watermark. GET /api/stacks returns correlation data. 11 escapeHtml calls, 55/55 braces balanced. "Stacks" nav link on all 61 pages. Sitemap + tools hub entry under Player Discovery.

### Phase 129 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/stacks endpoint | DONE | fetch_stacks, Pearson correlation |
| 2 | Stack Finder page | DONE | Corr badges, bar viz, combo PPG, 11 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 61 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 61/61 nav links |

## Previous Phase: Phase 128 — Weekly MVP Grid (COMPLETE)

**Exit criterion MET:** /weeklymvp.html shows the #1 PPR scorer at each position (QB/RB/WR/TE) for every week of the season. Grid layout with week rows and position columns. Each cell shows player name, team, and score with position-colored badge. Season selector, PNG export with watermark. GET /api/weekly-mvp returns weekly MVP data. 8 escapeHtml calls, 51/51 braces balanced. "Weekly MVP" nav link on all 60 pages. Sitemap + tools hub entry under Matchup & Schedule.

### Phase 128 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/weekly-mvp endpoint | DONE | fetch_weekly_mvp, top scorer per pos per week |
| 2 | Weekly MVP Grid page | DONE | Position×week grid, colored badges, 8 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 60 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 60/60 nav links |

## Previous Phase: Phase 127 — Handcuff Rankings (COMPLETE)

**Exit criterion MET:** /handcuffs.html ranks backup RBs by handcuff value. For each team, identifies the #1 RB (most carries) and #2 RB (handcuff). Ranks handcuffs by composite value score based on team rushing volume and handcuff efficiency/PPG. Shows starter info, handcuff stats (PPG, car/g, YPC), team rush/g, value score badge. Season selector, PNG export with watermark. GET /api/handcuffs returns ranked handcuff data. 12 escapeHtml calls, 48/48 braces balanced. "Handcuffs" nav link on all 59 pages. Sitemap + tools hub entry under Player Discovery.

### Phase 127 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/handcuffs endpoint | DONE | fetch_handcuffs, team RB pairing |
| 2 | Handcuff Rankings page | DONE | Table with starter/HC stats, value badge, 12 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 59 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 59/59 nav links |

## Previous Phase: Phase 126 — Fantasy Points Breakdown (COMPLETE)

**Exit criterion MET:** /fptsbreakdown.html shows scoring breakdown for all fantasy-relevant players. Stacked horizontal bars showing what percentage of PPR points come from: pass yards (blue), rush yards (teal), rec yards (terracotta), receptions (purple), TDs (red). Color legend, position filter tabs, season selector, PNG export with watermark. GET /api/fpts-breakdown returns component data. 16 escapeHtml calls, 69/69 braces balanced. "FPTS Breakdown" nav link on all 58 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 126 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/fpts-breakdown endpoint | DONE | fetch_fpts_breakdown, PPR component math |
| 2 | Scoring Breakdown page | DONE | Stacked bars, legend, 16 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 58 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 58/58 nav links |

## Previous Phase: Phase 125 — QA+UX Audit for Phases 121-124 (COMPLETE)

**Exit criterion MET:** QA+UX audit of Comparison Table (121), Record Book (122), Waiver Wire (123), Playoff Schedule (124). 0 HIGH, 0 MEDIUM, 3 LOW findings. All 4 pages pass XSS protection, error handling, loading states, PNG export, analytics, design compliance, and backend fantasy_relevant filter. No fixes needed — all LOW findings are acceptable behavior.

## Previous Phase: Phase 124 — Playoff Schedule Planner (COMPLETE)

**Exit criterion MET:** /playoffs.html shows players ranked by strength of their playoff schedule (weeks 14-17). Uses defense PPG-allowed-by-position data to grade each playoff matchup (A/B/C/D/F). Per-week matchup cells show opponent, grade badge, and actual PPR score. Overall playoff SOS grade per player. Position filter tabs, season selector, PNG export with watermark. GET /api/playoff-schedule returns playoff matchup data. 10 escapeHtml calls, 71/71 braces balanced. "Playoffs" nav link on all 57 pages. Sitemap + tools hub entry under Matchup & Schedule.

### Phase 124 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/playoff-schedule endpoint | DONE | fetch_playoff_schedule, def PPG grading |
| 2 | Playoff Schedule Planner page | DONE | Week columns, grade badges, SOS grade, 10 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 57 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 57/57 nav links |

## Previous Phase: Phase 123 — Waiver Wire Targets (COMPLETE)

**Exit criterion MET:** /waivers.html shows waiver wire targets — players with high recent PPG but low season PPG (likely unrostered). Compares recent window avg vs full season avg; requires delta >= 2 PPG surge and season avg <= 14 PPG. Position filter tabs, window selector (3/4/5 games), season selector, PNG export with watermark. GET /api/waivers returns waiver targets sorted by surge delta. Ranked list with surge badges, mini sparklines, games played. 12 escapeHtml calls, 60/60 braces balanced. "Waivers" nav link on all 56 pages. Sitemap + tools hub entry under Player Discovery.

### Phase 123 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/waivers endpoint | DONE | fetch_waivers, delta+season_avg filters |
| 2 | Waiver Wire Targets page | DONE | Ranked table, sparklines, surge badges, 12 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 56 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 56/56 nav links |

## Previous Phase: Phase 122 — Fantasy Record Book (COMPLETE)

**Exit criterion MET:** /records.html shows all-time fantasy records across 2020-present data. Four record categories: Single-Game Records (highest PPR score in one week), Single-Season Records (highest season total), Career PPG Leaders (min 20 games), Most Career Points. Gold/silver/bronze rank styling for top 3. Position filter tabs, position-colored chips, season badges. PNG export with watermark. GET /api/records returns all four record categories. 19 escapeHtml calls, 55/55 braces balanced. "Records" nav link on all 55 pages. Sitemap + tools hub entry under Rankings & Values.

### Phase 122 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/records endpoint | DONE | fetch_records, 4 record categories |
| 2 | Record Book page | DONE | 4-section grid, rank badges, 19 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 55 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 55/55 nav links |

## Previous Phase: Phase 121 — Multi-Player Comparison Table (COMPLETE)

**Exit criterion MET:** /comptable.html lets users add 2-8 players via search autocomplete and compare them in a sortable stat table. All box score stats shown (pass yd, rush yd, rec yd, TDs, targets, carries, catch rate, yards per carry/reception). Best-value highlighting (green bold) for the highest stat in each column. Player chip management (add/remove), season selector, URL state (?players=ID1,ID2,ID3&season=), PNG export with watermark. GET /api/compare-table returns full season stats for multiple players. 16 escapeHtml calls, 128/128 braces balanced. "Compare Table" nav link on all 54 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 121 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/compare-table endpoint | DONE | fetch_compare_table, multi-player stats |
| 2 | Comparison Table page | DONE | Player chips, sortable grid, best-value highlighting, 16 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 54 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 54/54 nav links |

## Previous Phase: Phase 120 — QA+UX Audit Fixes for Phases 116-119 (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings resolved. QA-1 (MEDIUM): Added fantasy_relevant = 1 filter to quick_search_players in live_data.py. 3 LOW findings (QA-2, QA-3, QA-4) triaged as no-action-needed. All 4 new pages pass security, design, and functionality checks.

### Phase 120 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | MEDIUM fix — quick-search fantasy_relevant | DONE | Added AND p.fantasy_relevant = 1 |
| 2 | Smoke test + commit + push | DONE | Verified |

## Previous Phase: Phase 119 — Season Recap (COMPLETE)

**Exit criterion MET:** /recap.html shows data-driven season year-in-review. MVP hero card with overall #1 scorer's total PPR + PPG + games. Position leader cards (QB1/RB1/WR1/TE1) with totals. Six recap sections: Highest Single Game (top 5 weekly scores with week badge), Biggest Breakouts (YoY PPG increase with delta badge), Biggest Busts (YoY PPG decrease), Most Consistent (lowest CoV), Most Volatile (highest CoV), Season Stats (total players + avg PPG). Season selector, URL state (?season=), PNG export with watermark. GET /api/season-recap computes all recap data including YoY comparisons. 30 escapeHtml calls, 73/73 braces balanced. "Recap" nav link on all 53 pages. Sitemap + tools hub entry under Matchup & Schedule.

### Phase 119 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/season-recap endpoint | DONE | fetch_season_recap with breakout/bust/consistency |
| 2 | Season Recap page | DONE | MVP hero, pos leaders, 6 recap sections, 30 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 53 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 53/53 nav links |

## Previous Phase: Phase 118 — Hot & Cold Streaks (COMPLETE)

**Exit criterion MET:** /streaks.html shows players on hot streaks (recent PPG significantly above season average) and cold streaks (recent PPG significantly below). Two-column layout with "On Fire" (green) and "Ice Cold" (red) sections. Mini bar sparklines showing recent game scores (green if above season avg, terracotta if below). Delta badges with absolute and percentage change. Streak window selector (3/4/5 games), position filter tabs, season selector, URL state (?season=&pos=&window=), PNG export with watermark. GET /api/streaks returns hot and cold player lists with recent scores. 10 escapeHtml calls, 68/68 braces balanced. "Streaks" nav link on all 52 pages. Sitemap + tools hub entry under Player Discovery.

### Phase 118 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/streaks endpoint | DONE | fetch_streaks, hot/cold by PPG delta |
| 2 | Streaks page | DONE | Two-column, sparklines, delta badges, 10 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 52 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 52/52 nav links |

## Previous Phase: Phase 117 — Game Log Viewer (COMPLETE)

**Exit criterion MET:** /gamelog.html lets users search any player and see week-by-week box score stats for any season. Position-specific column layouts (QB: pass stats + rush; RB: rush + receiving; WR/TE: receiving + rush). Sortable columns, season totals row, PPR color tiers (elite/great/ok/bad), player summary card with total points and PPG. Player search autocomplete with keyboard navigation, season selector, URL state (?player=ID&season=), PNG export with watermark. GET /api/game-log returns weekly stats with totals and available seasons. 15 escapeHtml calls, 120/120 braces balanced. "Game Log" nav link on all 51 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 117 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/game-log endpoint | DONE | fetch_game_log, per-week box score stats |
| 2 | Game Log page | DONE | Position-specific columns, sortable, totals row, 15 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 51 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 51/51 nav links |

## Previous Phase: Phase 116 — Season Pace & Milestone Tracker (COMPLETE)

**Exit criterion MET:** /pace.html projects per-game stats to full 17-game season, tracks progress toward position-specific milestones (QB: 4000/4500 pass yd, 30/40 pass TD, 500 rush yd; RB: 1000/1500 rush yd, 10 rush TD, 50 rec, 500 rec yd; WR: 1000/1500 rec yd, 100 rec, 10 rec TD, 150 tgt; TE: 800/1000 rec yd, 70 rec, 8 rec TD, 100 tgt). Progress bars with ON PACE/OFF PACE badges, pace-needed-per-game calculation, projected 17-game totals, position-specific stat chips. Position filter tabs, season selector, URL state (?season=&pos=), PNG export with watermark. GET /api/pace-tracker returns projections and milestone tracking. 22 escapeHtml calls, 79/79 braces balanced. "Pace" nav link on all 50 pages. Sitemap + tools hub entry under Performance Analysis.

### Phase 116 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/pace-tracker endpoint | DONE | fetch_pace_tracker, position-specific milestones |
| 2 | Pace & Milestones page | DONE | Player cards, milestone bars, stat chips, 22 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 50 pages updated |
| 4 | Smoke test | DONE | Python OK, JS OK, 50/50 nav links |

## Previous Phase: Phase 115 — QA+UX Audit Fixes for Phases 111-114 (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings from QA audit resolved. QA-1 (MEDIUM): Added fantasy_relevant filter to fetch_td_regression in live_data.py. QA-2 (LOW): Wrapped 8 stat cell outputs in escapeHtml in weeklyleaders.html. 2 LOW findings (QA-3, QA-4) triaged as no-action-needed.

### Phase 115 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | MEDIUM fix — TD regression fantasy_relevant filter | DONE | Added AND p.fantasy_relevant = 1 |
| 2 | LOW fix — Weekly leaders stat escaping | DONE | 8 stat cells wrapped in escapeHtml |
| 3 | Smoke test + commit + push | DONE | All fixes verified |

## Previous Phase: Phase 114 — Weekly Leaders Dashboard (COMPLETE)

**Exit criterion MET:** /weeklyleaders.html shows top fantasy performers for any selected week with gold/silver/bronze rank badges, sortable stat columns (PPR, pass yd, rush yd, rec, etc.), week navigation arrows (prev/next), position filter tabs, season selector, URL state (?season=&week=&pos=), PNG export with watermark. GET /api/weekly-leaders endpoint returns top 25 players for a given season/week with all box score stats, available weeks for the season. 7 escapeHtml calls, 58/58 braces balanced. "Week Leaders" nav link on all 49 pages. Sitemap + tools hub entry under Matchup & Schedule. Design matches DESIGN.md.

### Phase 114 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/weekly-leaders endpoint | DONE | fetch_weekly_leaders, per-week box score stats |
| 2 | Weekly Leaders page | DONE | Rank badges, sortable table, week nav, 7 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 49 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 49/49 nav links |

## Previous Phase: Phase 113 — Fantasy Points Breakdown (COMPLETE)

**Exit criterion MET:** /breakdown.html lets users search any player and see a canvas donut chart breaking down where their PPR fantasy points come from (passing yards, passing TDs, rushing yards, rushing TDs, receiving yards, receiving TDs, receptions). Color-coded donut slices with percentage labels, legend with point values, detail cards with raw stat counts. Player search autocomplete, season selector, URL state (?player=ID&season=), PNG export with watermark. GET /api/points-breakdown endpoint computes PPR scoring components (0.04/yd pass, 4/TD pass, 0.1/yd rush/rec, 6/TD, 1/rec). 16 escapeHtml calls, 54/54 braces balanced. "Breakdown" nav link on all 48 pages. Sitemap + tools hub entry under Performance Analysis. Design matches DESIGN.md.

### Phase 113 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/points-breakdown endpoint | DONE | fetch_points_breakdown, PPR scoring components |
| 2 | Points Breakdown page | DONE | Canvas donut, legend, detail cards, 16 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 48 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 48/48 nav links |

## Previous Phase: Phase 112 — Player Strengths & Weaknesses (COMPLETE)

**Exit criterion MET:** /strengths.html lets users search any player and see their top 4 strengths and bottom 4 weaknesses based on position-relative percentile rankings. Player header card with overall grade (avg percentile). Strength/weakness cards with rank number, stat label, value, mini percentile bar, and letter grade badge. Full percentile breakdown with horizontal bars sorted by percentile (color-coded green/blue/yellow/orange/red). Player search autocomplete via quick-search API with keyboard navigation. Season selector, URL state (?player=ID&season=), PNG export with watermark. GET /api/player-strengths endpoint wraps fetch_player_percentiles, sorting percentiles to find top strengths and weaknesses, assigning A+ to F grades. 18 escapeHtml calls, 57/57 braces balanced. "Strengths" nav link on all 47 pages. Sitemap + tools hub entry under Player Discovery. Design matches DESIGN.md.

### Phase 112 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/player-strengths endpoint | DONE | Wraps fetch_player_percentiles, sorts for top/bottom, adds grades |
| 2 | Strengths & Weaknesses page | DONE | Two-column card layout, grade badges, percentile bars, 18 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 47 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 47/47 nav links |

## Previous Phase: Phase 111 — TD Regression Dashboard (COMPLETE)

**Exit criterion MET:** /regression.html shows touchdown regression candidates — players whose TD rate deviates from position average, with expected vs actual TDs, regression delta badges, TD rate badges colored by deviation from average, position avg rate chips, "Regression Up" (due for more TDs) and "Regression Down" (unsustainable TD rate) sections, sortable columns, position filter tabs, season selector, URL state (?season=&pos=), PNG export with watermark. GET /api/td-regression endpoint computes position-average TD rates from aggregate opportunity totals, expected TDs from opportunities x avg rate, regression delta. Min 6 games, 40+ opportunities. 10 escapeHtml calls, 259/259 braces balanced. "TD Regression" nav link on all 46 pages. Sitemap + tools hub entry under Player Discovery. Design matches DESIGN.md.

### Phase 111 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/td-regression endpoint | DONE | fetch_td_regression, position avg TD rates, expected vs actual TDs |
| 2 | TD Regression page | DONE | Two sections (up/down), delta badges, rate badges, rate chips, 10 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 46 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 46/46 nav links |

## Previous Phase: Phase 110 — QA+UX Audit Fixes (Phases 106-109) (COMPLETE)

**Exit criterion MET:** /regression.html shows touchdown regression candidates — players whose TD rate deviates from position average, with expected vs actual TDs, regression delta badges, TD rate badges colored by deviation from average, position avg rate chips, "Regression Up" (due for more TDs) and "Regression Down" (unsustainable TD rate) sections, sortable columns, position filter tabs, season selector, URL state (?season=&pos=), PNG export with watermark. GET /api/td-regression endpoint computes position-average TD rates from aggregate opportunity totals, expected TDs from opportunities × avg rate, regression delta. Min 6 games, 40+ opportunities. 10 escapeHtml calls, 259/259 braces balanced. "TD Regression" nav link on all 46 pages. Sitemap + tools hub entry under Player Discovery. Design matches DESIGN.md.

### Phase 111 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/td-regression endpoint | DONE | fetch_td_regression, position avg TD rates, expected vs actual TDs |
| 2 | TD Regression page | DONE | Two sections (up/down), delta badges, rate badges, rate chips, 10 escapeHtml |
| 3 | Nav links + sitemap + tools hub | DONE | All 46 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 46/46 nav links |

## Previous Phase: Phase 110 — QA+UX Audit Fixes (Phases 106-109) (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings resolved. QA-1: Career row rate stats now computed from weighted counting-stat totals (rec/tgt, completions/att, rush_yd/car) instead of simple season averages. QA-2: Draft class position tab borders 2px to 3px. QA-3: Percentile bar track border 2px to 3px. QA-4: Career compare legend dot border 2px to 3px. QA-5: Draft class player join now strips Jr./III/II suffixes for better name matching.

### Phase 110 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fix — career row rate stats (QA-1) | DONE | Weighted from counting stat totals |
| 2 | MEDIUM fixes (QA-2-5) | DONE | 3px borders, suffix-stripped name join |
| 3 | Smoke test | DONE | Python OK, braces OK |

## Previous Phase: Phase 109 — Player Percentiles (COMPLETE)

**Exit criterion MET:** /percentiles.html lets users search for any player and see position-relative percentile rankings across 8 stat categories with color-coded horizontal bars. Position-specific metrics (QB: pass yd/g, comp%, rush yd/g, etc.; RB: rush yd/g, ypc, rec/g, etc.; WR/TE: rec/g, tgt/g, rec yd/g, ypr, catch%, etc.). Bar colors scale from green (90th+) through blue/orange to red (<25th). Average percentile summary. Season selector, URL state (?player=ID&season=), PNG export with watermark. GET /api/player-percentiles endpoint computes percentiles vs. same-position players with 4+ games. 22 escapeHtml calls, 86/86 braces balanced. "Percentiles" nav link on all 45 pages. Sitemap + tools hub entry. Design matches DESIGN.md.

### Phase 109 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/player-percentiles endpoint | DONE | fetch_player_percentiles, position-relative, 8 metrics |
| 2 | Player Percentiles page | DONE | Percentile bars, color coding, season selector, 22 escapeHtml |
| 3 | Nav links + sitemap | DONE | All 45 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 45/45 nav links |

## Previous Phase: Phase 108 — Draft Class Tracker (COMPLETE)

**Exit criterion MET:** /draftclass.html shows fantasy production by NFL draft class (2020-2025). Class-level summary chips (total players, avg PPG, hits, busts, hit rate). Round-by-round ROI canvas bar chart showing avg PPG per draft round. Sortable player table with pick number, name, position badge, drafted/current team, games, PPG, total PPR, and hit/bust verdict badges (HIT=15+ PPG, SOLID=10+, OK=5+, BUST=<5). Draft year selector, position filter tabs, URL state (?year=&pos=), PNG export. GET /api/draft-class endpoint joins draft_picks to player_week_stats via player name+position. 21 escapeHtml calls, 98/98 braces balanced. "Draft Class" nav link on all 44 pages. Sitemap + tools hub entry. Design matches DESIGN.md.

### Phase 108 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/draft-class endpoint | DONE | fetch_draft_class, join draft_picks to stats, verdicts |
| 2 | Draft Class Tracker page | DONE | Summary chips, round chart, sortable table, 21 escapeHtml |
| 3 | Nav links + sitemap | DONE | All 44 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 44/44 nav links |

## Previous Phase: Phase 107 — Career Comparison (COMPLETE)

**Exit criterion MET:** /career-compare.html lets users add 2-3 players via autocomplete search and see overlapping PPG career trajectory charts on a single canvas with position-colored lines, side-by-side career summary table (PPG, total PPR, games, seasons, peak, trajectory), season-by-season PPG comparison table with best values highlighted, PNG export with watermark, URL state (?p1=ID&p2=ID&p3=ID). Reuses /api/career-stats endpoint (no new backend). 21 escapeHtml calls, 145/145 braces balanced. "Career Compare" nav link on all 43 pages. Sitemap + tools hub entry. Design matches DESIGN.md.

### Phase 107 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Career Comparison page | DONE | Multi-player PPG overlay chart, summary + season tables, 21 escapeHtml |
| 2 | Nav links + sitemap | DONE | All 43 pages updated, sitemap + tools hub |
| 3 | Smoke test | DONE | Python OK, JS OK, 43/43 nav links |

## Previous Phase: Phase 106 — Career Stats Timeline (COMPLETE)

**Exit criterion MET:** /career.html shows season-by-season player stats (2020-2024) with canvas PPG trajectory chart, career highs badges, position-specific stat tables (QB/RB/WR/TE columns), trajectory analysis (rising/falling/stable), career totals row, player search autocomplete, URL state (?player=ID), PNG export with watermark. GET /api/career-stats endpoint returns player info, seasons array, career summary, career_highs. 31 escapeHtml calls, 183/183 braces balanced. "Career" nav link on all 42 pages. Sitemap + tools hub entry. Design matches DESIGN.md.

### Phase 106 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/career-stats endpoint | DONE | fetch_career_stats, season-by-season aggregates, trajectory analysis |
| 2 | Career Stats Timeline page | DONE | Canvas PPG chart, career highs, position-specific tables, 31 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 42 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 42/42 nav links |

## Previous Phase: Phase 105 — QA+UX Audit Fixes (Phases 101-104) (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings resolved. QA-1: Fixed auction math — use top N players' TV as denominator so a team's picks sum to budget. QA-2: Added available_seasons to dashboard endpoint + season selector dropdown. QA-3: Fixed trailing & in URL construction (tiers, archetypes). QA-4: Dashboard scarcity uses mid_player name instead of hardcoded #12. QA-5: Tier descriptions now rendered in tier label. QA-6: Catch-all archetypes renamed (Other RB/WR/TE). QA-7: Form control borders updated to 3px on auction/tiers/archetypes.

### Phase 105 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fix — auction math (QA-1) | DONE | top_n_tv denominator, cap at budget |
| 2 | HIGH fix — dashboard season selector (QA-2) | DONE | available_seasons + select dropdown |
| 3 | MEDIUM fixes (QA-3-7) | DONE | URL params, scarcity label, tier desc, archetype names, borders |
| 4 | Smoke test | DONE | Python OK, braces balanced on all 4 pages |

## Previous Phase: Phase 104 — Player Archetypes (COMPLETE)

**Exit criterion MET:** /archetypes.html classifies players into statistical archetypes based on per-game stats. 18 archetype definitions across 4 positions (QB: Dual-Threat/Gunslinger/Game Manager/Rushing/Backup; RB: Workhorse/Pass-Catcher/Efficient/TD Vulture/Committee; WR: Alpha/Deep Threat/Possession/YAC Monster/Role Player; TE: Elite Receiving/Red Zone/Reliable/Blocking). Archetype cards with icon, name, description, position badge, player count, player grid with PPG and key stat. Position filter tabs. Season selector. PNG export. GET /api/player-archetypes endpoint. 14 escapeHtml, 72/72 braces. "Archetypes" nav link on all 41 pages. Sitemap + tools hub entry. Design matches DESIGN.md.

### Phase 104 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/player-archetypes endpoint | DONE | 18 archetypes, stat-threshold classification |
| 2 | Archetypes page | DONE | Archetype cards, player grids, icons, 14 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 41 pages, sitemap + tools hub |
| 4 | Smoke test | DONE | Python OK, JS OK, 41/41 nav links |

## Previous Phase: Phase 103 — Dynasty Tier List (COMPLETE)

**Exit criterion MET:** /tiers.html page shows players grouped into 6 visual tiers (S/A/B/C/D/F) based on composite trade value. Each tier is a color-coded horizontal row (S=red, A=terracotta, B=gold, C=teal, D=blue, F=gray) with tier letter on the left and player chips inside. Chips show position badge, name, and trade value. Position filter tabs (All/QB/RB/WR/TE). Season selector. PNG export with watermark. Responsive at 768px (tiers stack vertically) + 480px. GET /api/tier-list endpoint with season/position params returns players grouped by tier with descriptions. Tier breaks: S(80+), A(65+), B(50+), C(35+), D(20+), F(<20). 9 escapeHtml calls, 73/73 braces balanced. "Tiers" nav link on all 40 HTML pages. Sitemap entry. Tools hub catalog entry. Design matches DESIGN.md.

### Phase 103 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/tier-list endpoint | DONE | fetch_tier_list, 6 tiers by TV thresholds |
| 2 | Tier List page | DONE | Horizontal tier rows, player chips, pos filters, 9 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 40 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python syntax OK, JS braces balanced, 40/40 nav links |

### Decisions Log
- **Tier List as Phase 103**: Tier lists are the single most screenshotted format on r/DynastyFF. Every dynasty content creator makes tier lists. Ours is auto-generated from trade values, so it updates with data. The S/A/B/C/D/F format is universally understood and instantly shareable. Player chips inside tiers make it visually scannable.
- **Tier thresholds**: S(80+) = truly elite (maybe 3-5 players), A(65+) = blue chips, B(50+) = solid starters, C(35+) = flex plays, D(20+) = depth, F(<20) = cut candidates. These thresholds create a natural distribution that matches how dynasty players think about tiers.

## Previous Phase: Phase 102 — Dynasty Dashboard (COMPLETE)

**Exit criterion MET:** /dashboard.html shows a single-page dynasty overview aggregating key insights. Top 5 overall players with trade value cards. Position trend cards (avg PPG, player count, avg age, avg TV per position). Four-panel grid: Rising Stocks (trade value >> PPG rank), Falling Stocks (PPG rank >> trade value), Value Picks (young + high TV + strong PPG), and Quick Links to key tools. Position Scarcity section with drop-off bars showing PPG cliff from #1 to #12 per position. PNG export with watermark. GET /api/dynasty-dashboard endpoint returns risers, fallers, value_picks, position_scarcity, trends, top5. 26 escapeHtml calls, 103/103 braces balanced. "Dashboard" nav link on all 39 HTML pages. Sitemap entry. Tools hub catalog entry. Design matches DESIGN.md.

### Phase 102 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/dynasty-dashboard endpoint | DONE | Single optimized query, PPG/TV rank diff for risers/fallers |
| 2 | Dashboard page | DONE | Top 5, trends, 4-panel grid, scarcity bars, 26 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 39 pages updated, sitemap + tools hub |
| 4 | Smoke test | DONE | Python syntax OK, JS braces balanced, 39/39 nav links |

### Decisions Log
- **Dynasty Dashboard as Phase 102**: A single-page overview that aggregates the most useful insights from multiple tools. This is the "front page" of dynasty analysis — the thing a user opens every day to check what's changed. Risers/fallers catch attention, value picks drive action, scarcity bars inform draft strategy. Quick links section turns the dashboard into a hub that drives traffic to deeper tools.
- **Rank diff approach for risers/fallers**: Instead of calling multiple expensive functions (stock watch, efficiency, etc.), we compute a simple rank_diff (ppg_rank - tv_rank). Players where trade value is much higher than PPG rank are "rising" (age/scarcity boost their dynasty value beyond current production). Players where PPG rank is much higher are "falling" (producing now but aging/position works against them). Clean, fast, and meaningful.

## Previous Phase: Phase 101 — Dynasty Auction Value Calculator (COMPLETE)

**Exit criterion MET:** /auction.html page converts dynasty trade values into auction dollar amounts for a configurable budget ($50-$500 slider). Budget slider with live display, roster size input (8-25), season selector. Position summary cards showing top value and avg per position. Sortable player table with rank, position badge, auction dollar value (color-coded by tier), trade value bar, PPG, tier badge (Premium/Starter/Value/Bargain/$1 Filler). Position filter tabs. Player search. PNG export with watermark. GET /api/auction-values endpoint with budget, roster_size, season params. 15 escapeHtml calls, 118/118 braces balanced. "Auction" nav link on all 38 HTML pages. Sitemap entry. Tools hub catalog entry under Rankings & Values. Design matches DESIGN.md.

### Phase 101 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/auction-values endpoint | DONE | fetch_auction_values in live_data.py, proportional dollar conversion |
| 2 | Auction Values page | DONE | Budget slider, pos summary, sortable table, tier badges, 15 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 38 pages updated, sitemap entry, tools hub catalog |
| 4 | Smoke test | DONE | Python syntax OK, JS braces balanced, 38/38 nav links |

### Decisions Log
- **Auction Value Calculator as Phase 101**: With NFL Draft approaching (April 24), auction draft tools are in peak demand. Converts our existing trade value infrastructure into practical auction dollars. Budget slider ($50-$500) covers all league formats. Roster size input (8-25) handles dynasty to redraft. Tier system (Premium $40+, Starter $20+, Value $10+, Bargain $5+, $1 Filler) gives quick draft-day guidance. Highly screenshottable — dollar values on every player is the most shared format in fantasy communities.
- **Dollar conversion formula**: Reserve $1 per roster spot for bench filler, distribute remaining budget proportionally by trade value across all players × roster size. This naturally creates a realistic distribution where top players command large shares.

## Previous Phase: Phase 100 — QA+UX Audit Fixes (Phases 96-99) (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings from QA-AUDIT.md resolved. QA-1: roster-grade player_ids deduplicated + type-validated. QA-2: standard scoring formula consistent (Python subtraction in both scoring-comparison and cheat-sheet). QA-3/4/5: escapeHtml on numeric values (rank_ppr, rank_std, age, rank). QA-6: tools-hub Cache-Control header. QA-7: Boom/Bust→Player Comparison rename. QA-8: removed redundant import math. QA-9: cheat sheet limited to top 40 per position. UX-2: dimension bar tooltips on roster builder.

### Phase 100 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fix — roster-grade player_ids dedup (QA-1) | DONE | dict.fromkeys dedup + str validation + [:25] |
| 2 | HIGH fix — consistent standard scoring (QA-2) | DONE | Both use Python total_ppr - total_rec |
| 3 | MEDIUM fixes — escapeHtml (QA-3,4,5) | DONE | rank_ppr, rank_std, age, rank wrapped |
| 4 | MEDIUM fix — Cache-Control (QA-6) | DONE | JSONResponse + Cache-Control: public, max-age=3600 |
| 5 | LOW grouped fixes (QA-7,8,9,UX-2) | DONE | Rename, remove import, top-40 limit, tooltips |
| 6 | Smoke test | DONE | Python syntax OK, JS braces balanced |

## Previous Phase: Phase 99 — Fantasy Draft Cheat Sheet (COMPLETE)

**Exit criterion MET:** /cheatsheet.html page shows a printable 4-column dynasty draft cheat sheet (QB/RB/WR/TE). Each column: position-colored header with player count, tier break dividers (Elite/Starter/Flex/Bench/Stash based on PPG thresholds), player rows with rank, name, team, PPG. Format selector tabs (PPR/Half-PPR/Standard). Season selector. Print-optimized CSS (@media print hides nav/footer/controls, adjusts sizing). PNG export with watermark. Responsive at 768px (2-col) + 480px (1-col). GET /api/cheat-sheet endpoint returns players grouped by position, sorted by PPG for selected format, with tier labels and trade values. Min 4 games + 2 PPG filter. "Cheat Sheet" nav link on all 37 HTML pages. Sitemap entry. Tools hub catalog entry. Design matches DESIGN.md.

### Phase 99 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/cheat-sheet endpoint | DONE | fetch_cheat_sheet in live_data.py, 3 formats, 5 tiers |
| 2 | Cheat Sheet page | DONE | 4-col grid, tier breaks, format tabs, print CSS, 6 escapeHtml, 23/23 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 37 pages updated, sitemap entry, tools hub catalog |
| 4 | Smoke test | DONE | Python + JS syntax clean, 37/37 nav links, design compliance |

### Decisions Log
- **Draft Cheat Sheet as Phase 99**: The most practical tool for draft season. Every fantasy player prints or screenshots a cheat sheet. The 4-column format (one per position) with tier breaks is the standard layout. Format selector (PPR/Half/Standard) adds unique value — most cheat sheets are PPR-only. Print CSS makes it genuinely usable as a printout.
- **Tier thresholds**: Elite (20+ PPG), Starter (15+), Flex (10+), Bench (5+), Stash (<5). These are universal fantasy thresholds that work across all formats. Simple and intuitive — no complex percentile calculations needed.

## Previous Phase: Phase 98 — Scoring Format Comparison (COMPLETE)

**Exit criterion MET:** /scoring.html page shows how player rankings shift across PPR, Half-PPR, and Standard scoring. Two sections: PPR Risers (players who rank higher in PPR than Standard — reception-dependent players) and PPR Fallers (players who rank lower — rushing-heavy players). Each player row: position badge, headshot, name, team, 3 PPG columns (PPR/Half/Std), PPR rank, Std rank, rank shift badge (green up / red down with +/- number). Position filter tabs (All/QB/RB/WR/TE). Season selector. PNG export with watermark. Responsive at 768px + 480px. GET /api/scoring-comparison endpoint computes per-player PPG across all 3 formats, ranks independently, returns rank_diff (std_rank - ppr_rank). Min 6 games + 2 PPG filter. "Scoring" nav link on all 36 HTML pages. Sitemap entry. Tools hub catalog entry. Design matches DESIGN.md.

### Phase 98 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/scoring-comparison endpoint | DONE | fetch_scoring_comparison in live_data.py, 3-format PPG + ranks |
| 2 | Scoring Format page | DONE | Risers/fallers tables, rank shift badges, 8 escapeHtml, 22/22 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 36 pages updated, sitemap entry, tools hub catalog |
| 4 | Smoke test | DONE | Python + JS syntax clean, 36/36 nav links, design compliance |

### Decisions Log
- **Scoring Format Comparison as Phase 98**: One of the most common questions in fantasy football is "how much does PPR vs Standard change rankings?" This page answers it visually. Extremely screenshottable: "These WRs gain 15+ ranks in PPR." Leverages existing 3-format scoring data already in player_week_stats. Natural complement to the trade values and VORP dashboards.
- **Rank diff = std_rank - ppr_rank**: Positive means the player gains rank (is better) in PPR. This frames it as "PPR helps these players" vs "PPR hurts these players," which is intuitive.

## Previous Phase: Phase 97 — Dynasty Roster Builder (COMPLETE)

**Exit criterion MET:** /rosterbuilder.html page lets users build a hypothetical dynasty roster (up to 25 players) via autocomplete search. Live roster grade card shows letter grade (A+ to F) and composite score (0-100) based on 4 dimensions: trade value (35%), VORP (25%), age balance (20%), positional depth (20%). Visual dimension progress bars colored by metric. Position group summary grid (QB/RB/WR/TE with count, avg trade value, total VORP). Per-player rows with headshot, position badge, name, team, age, trade value, VORP badge. Total roster trade value displayed. Clear/Export PNG/Copy Share URL buttons. URL state (?players=id1,id2,...) for shareable roster links. POST /api/roster-grade endpoint accepts player_ids array, reuses compute_trade_value + VORP replacement thresholds. "Roster Builder" nav link added to all 35 HTML pages. Sitemap entry. Added to Tools Hub catalog. Design matches DESIGN.md.

### Phase 97 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/roster-grade endpoint | DONE | fetch_roster_grade in live_data.py, 4 dimensions, grade thresholds |
| 2 | Roster Builder page | DONE | Autocomplete, live grade, dimension bars, position grid, 14 escapeHtml, 58/58 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 35 pages updated, sitemap entry, tools hub catalog |
| 4 | Smoke test | DONE | Python + JS syntax clean, 35/35 nav links, 14/14 design checks |

### Decisions Log
- **Roster Builder as Phase 97**: After building the Tools Hub (Phase 96), the next high-value interactive tool is a roster builder. Dynasty managers constantly evaluate "how does my team look?" — this tool lets them build a roster and get an instant composite grade. Extremely screenshottable: "My dynasty team gets a B+." Combines trade value (Phase 93) and VORP (Phase 92) into a unified roster-level analysis.
- **4-dimension grading**: Trade value (35% — are your players valuable?), VORP (25% — are they above replacement?), age balance (20% — is the roster age-diversified or top-heavy?), positional depth (20% — do you have the right position mix?). Weights prioritize asset value since dynasty is about long-term value accumulation.
- **Static VORP thresholds**: Used approximate replacement PPG values (QB 14.5, RB 8.0, WR 8.5, TE 7.0) instead of computing from the full player universe. This avoids an expensive secondary query and gives consistent grades regardless of which players are in the roster.

## Previous Phase: Phase 96 — Tools Hub (COMPLETE)

**Exit criterion MET:** /tools.html page organizes all 30 analytical dashboards into 7 categorized sections (Rankings & Values, Player Discovery, Performance Analysis, Usage & Opportunity, Matchup & Schedule, Visualizations, Team & League). Each category: header with icon + name + tool count badge. Each tool card: name, 1-line description, position chips (QB/RB/WR/TE), category-colored top stripe, direct link to page. Search input filters tools by name/description in real-time. Category filter tabs (All + 7 categories). Empty state for no matches. Hover-lift on cards. PNG export with watermark. Responsive at 768px + 480px. /api/tools-hub endpoint returns static JSON catalog with 7 categories and 30 tools. "Tools" nav link added to all 34 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md.

### Phase 96 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/tools-hub endpoint | DONE | Static JSON catalog, 7 categories, 30 tools |
| 2 | Tools Hub page | DONE | Card grid, search, category tabs, 14 escapeHtml, 29/29 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 34 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 34/34 nav links, XSS escaped, 15/15 design checks |

### Decisions Log
- **Tools Hub as Phase 96**: With 33 HTML pages, new users are overwhelmed by the nav bar. A Bloomberg-style "Tools Hub" directory page organizes all analytical dashboards into categorized cards, making the platform discoverable. Extremely screenshottable: "look at everything this free tool offers." Serves as a natural landing page for users exploring beyond the Lab. Also helps SEO — one page that links to every tool with descriptions.
- **7 categories**: Grouped tools by user intent (Rankings & Values = "what are players worth?", Player Discovery = "who should I target?", Performance Analysis = "how good is this player?", etc.) rather than by technical implementation. This matches how fantasy managers think.
- **Static endpoint**: Tool catalog is configuration data, not database-driven. Simple static JSON endpoint keeps it lightweight with zero DB queries.

## Previous Phase: Phase 95 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All HIGH and MEDIUM findings from QA-AUDIT.md (Phases 91-94) resolved. Trade finder shows helpful error with player info when player doesn't qualify (min 4 games / 2 PPG). fantasy_relevant filter added to fetch_trade_value_chart and fetch_trade_finder SQL queries. Trade finder percentile computation uses pre-sorted arrays with bisect (O(n log n) vs O(n^2)). Trade finder 3-factor stock scoring documented (excludes SOS for performance). Trade finder buy_low/sell_high deduplicated from equal_targets. VORP `name` → `full_name` field consistency across backend + frontend. Trade finder contextual empty-state messages for buy-low/sell-high. VORP replacement section adapts count to position filter (10 vs 25).

### Phase 95 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fix — Trade Finder helpful error | DONE | Structured error with player info + explanation |
| 2 | MEDIUM fix — fantasy_relevant filter | DONE | Both trade value + finder queries updated |
| 3 | MEDIUM fix — Pre-sort percentile_rank | DONE | bisect_left/bisect_right, pct_rank + pct_rank_inv |
| 4 | MEDIUM fix — Stock scoring documented | DONE | 3-factor simplification with inline comment |
| 5 | MEDIUM grouped — LOW fixes | DONE | Dedup, VORP full_name, empty states, adaptive count |
| 6 | Smoke test | DONE | Python + JS syntax clean, all fixes verified |

### Decisions Log
- **QA+UX audit at Phase 95**: Triggered by phase 95 being a multiple of 5. Audited phases 91-94. Found 1 HIGH (trade finder error UX), 4 MEDIUM (fantasy_relevant filter, O(n^2) percentile, stock model mismatch, nav bloat), 4 LOW (dedup, field name, empty states, replacement count). No CRITICALs. Nav bloat (UX-2) logged for future structural redesign.

## Previous Phase: Phase 94 — Trade Finder (COMPLETE)

**Exit criterion MET:** /tradefinder.html page lets user search for any player via autocomplete (quick-search API), shows selected player card (headshot, position badge, team, age, trade value, PPG, GP, stock score, tier badge, stock trend arrow), and displays three target sections: "Equal Value Targets" (within +/- 8 trade value points, sorted by closest match), "Buy Low Targets" (higher value but falling stock — buy the dip), and "Sell High Targets" (lower value but rising stock — sell into strength). Each target row: player cell (headshot + name), position badge, team, age, value bar (position-colored, width proportional), trade value number, value differential chip (+/- with green/red/neutral colors), stock trend arrow (rising green / falling red / stable grey), PPG, tier badge. Position filter tabs on targets (All/QB/RB/WR/TE). URL state (?player=ID&season=). Click any target → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px. /api/trade-finder endpoint accepts player_id + season, combines trade value model (production 50% + age 30% + scarcity 20%) with stock scoring (PPO/CoV/PPG percentiles), returns selected_player + equal_targets + buy_low + sell_high lists. Min 4 games + 2 PPG filter. "Trade Finder" nav link added to all 33 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md.

### Phase 94 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/trade-finder endpoint | DONE | fetch_trade_finder in live_data.py, trade value + stock scoring, equal/buy-low/sell-high split |
| 2 | Trade Finder page | DONE | Player search autocomplete, selected card, 3 target tables, 23 escapeHtml, 60/60 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 33 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 33/33 nav links, XSS escaped, design compliance |

### Decisions Log
- **Trade Finder as Phase 94**: After building the trade value chart (Phase 93), the natural next tool is a trade target finder — the most common use case for dynasty trade value data is "who can I trade for?" This combines trade values with stock watch data (Phase 87) to surface not just equal-value targets but also buy-low opportunities (higher value + falling stock) and sell-high candidates (lower value + rising stock). Extremely screenshottable: "Put in Saquon Barkley → here are your trade targets." The search-first UX pattern is a departure from the table-heavy dashboards, providing variety.
- **Stock scoring integration**: Rather than just matching on trade value alone, the Trade Finder adds a stock score dimension (PPO + CoV + PPG percentiles) to identify momentum-based opportunities. Players with falling stocks at higher trade values are buy-low targets (the market hasn't caught up to the decline). Players with rising stocks at lower trade values are sell-high targets (the market hasn't caught up to the surge).
- **+/- 8 trade value range for equal targets**: Wide enough to show meaningful options across positions, narrow enough that trades feel fair. The differential chip shows the exact gap.

## Previous Phase: Phase 93 — Dynasty Trade Value Chart (COMPLETE)

**Exit criterion MET:** /tradevalues.html page shows a dynasty trade value chart ranking all fantasy-relevant players by composite trade value (production 50% + age curve 30% + positional scarcity 20%). Visual horizontal bar chart with position-colored bars (QB blue, RB teal, WR terracotta, TE purple), grouped into 8 dynasty tiers (Elite/Blue Chip/Premium/Solid/Promising/Depth/Roster Clogger/Cut Bait). Each player row: rank number (top-3 gold/silver/bronze), position badge, headshot, name, team, age, trade value bar (width proportional to 0-100 score, position-colored), PPG, GP, tier badge. Component breakdown in tooltip (production/age/scarcity scores). Methodology chips showing weight breakdown. Player search input for filtering. Position filter tabs (All/QB/RB/WR/TE). Season selector. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px. /api/trade-value-chart endpoint computes trade values using compute_trade_value (production + age + scarcity), assigns 8-tier labels, returns component breakdown. Min 4 games + 2 PPG filter. "Trade Values" nav link added to all 32 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md.

### Phase 93 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/trade-value-chart endpoint | DONE | fetch_trade_value_chart in live_data.py, composite value + component breakdown + 8-tier assignment |
| 2 | Trade Value Chart page | DONE | Horizontal bar chart, position-colored bars, tier groups, search, 13 escapeHtml, 37/37 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 32 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 32/32 nav links, XSS escaped, design compliance |

### Decisions Log
- **Dynasty Trade Value Chart as Phase 93**: After 20+ individual metric dashboards and composite views (report card, awards, VORP), a visual trade value chart fills the most-requested gap in dynasty fantasy football. KeepTradeCut and Fantasy Calc trade value charts are the #1 most referenced resource in r/DynastyFF. Razzle's version uses our own composite model (production + age curve + positional scarcity) and displays values as a horizontal bar chart — visually distinct from our table-heavy dashboards and extremely screenshottable. The bar chart format makes cross-position value comparison intuitive at a glance.
- **8-tier grouping**: Tiers segment the chart into meaningful groups (Elite through Cut Bait) so users can quickly find their tier. More granular than the 5-tier VORP badges but aligned with common dynasty tier structures.
- **Search + filter**: Added player search input because trade value charts are primarily used as lookup tools ("what's Player X worth?"). Search filters client-side from the loaded data for instant results.

## Previous Phase: Phase 92 — Value Over Replacement Player (VORP) Dashboard (COMPLETE)

**Exit criterion MET:** /vorp.html page shows VORP analysis with two sections: "League Winners" (highest VORP — PPG above position replacement level, cross-position ranking) and "Replacement Level" (near/below replacement level — waiver-wire caliber players). Each player: position badge, headshot, name, team, VORP value badge (elite >=6 green, starter >=3 blue, flex >=1 yellow, fringe >=0 orange, replacement <0 red), PPG, Replacement PPG, Position Rank, GP, Caveat annotation. Replacement threshold chips showing QB12/RB24/WR36/TE12 PPG baselines. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state per section. Click row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px. /api/vorp endpoint computes VORP = player PPG - position replacement PPG (QB12/RB24/WR36/TE12). Min 6 games + 2 PPG filter. "VORP" nav link added to all 31 HTML pages. Sitemap entry. Analytics tracking. Design matches DESIGN.md.

### Phase 92 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/vorp endpoint | DONE | fetch_vorp in live_data.py, replacement-level per position, league_winners/replacement_level split |
| 2 | VORP Dashboard page | DONE | Two-section table, VORP badges, threshold chips, 10 escapeHtml, 61/61 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 31 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 31/31 nav links, XSS escaped, design compliance |

### Decisions Log
- **VORP as Phase 92**: After building 20+ individual metric dashboards and composite views (report card, awards), VORP fills a foundational gap. Value Over Replacement is the single most important cross-position ranking metric in fantasy football analytics — it answers "how much better is this player than what I can get for free?" Replacement thresholds (QB12/RB24/WR36/TE12) are standard for 12-team leagues. Highly screenshottable for r/DynastyFF ("VORP leaders: these players are the biggest league-winners").
- **Replacement threshold chips**: Added visual chips above the tables showing each position's replacement-level PPG baseline. This gives context to the VORP numbers and helps users understand why a QB with 22 PPG has lower VORP than an RB with 18 PPG.

## Previous Phase: Phase 91 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All HIGH findings from QA-AUDIT.md (Phases 86-90) resolved. Position-filtered team totals now use separate unfiltered SQL query for correct opp_share/dominator metrics in fetch_opportunity_share, fetch_report_cards, and fetch_season_awards. PNG export watermark overlay added to reportcard.html and awards.html (ctx.fillText). MEDIUM fixes applied: grade string sort uses numeric GRADE_ORDER map (A+=8...F=1) in reportcard/stocks/opportunity, reportcard analytics includes referrer field, awards analytics uses .catch() instead of try/catch. All fixes verified with Python syntax checks and JS structure validation.

### Phase 91 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fix — Position filter team totals | DONE | 3 functions fixed, unfiltered team totals SQL query |
| 2 | HIGH fix — PNG export watermark overlay | DONE | reportcard + awards now draw canvas watermark |
| 3 | MEDIUM fixes — Grade sort + analytics | DONE | GRADE_ORDER map, referrer field, .catch() |
| 4 | Smoke test | DONE | Python + JS syntax clean, all fixes verified |

### Decisions Log
- **QA+UX audit at Phase 90**: Triggered by phase 90 being a multiple of 5. Audited all files from phases 86-90. Found 2 HIGH issues (position-filtered team totals inflating opp_share + missing PNG watermark), 4 MEDIUM issues (grade sort, referrer, promise catch), 3 LOW (no action). No CRITICALs.

## Previous Phase: Phase 90 — Fantasy Season Superlatives Dashboard (COMPLETE)

**Exit criterion MET:** /awards.html page shows fantasy season superlatives — data-driven awards crowning winners across all Razzle metric systems. 10 award categories: MVP (highest Fantasy GPA), Most Efficient (highest PPO), Iron Man (most consistent, lowest CoV), Schedule Survivor (best production despite hardest SOS), Volume King (highest opportunity share), Breakout Star (age-weighted volume + production), Rising Stock (highest stock delta), Dominator (highest dominator rating), Red Zone King (most GL TDs), Best Floor (highest 10th-percentile weekly score). Each award: trophy/badge emoji icon, award name + description, winner showcase card (headshot, name, position badge, team, PPG, GPA/Eff/Con/SOS grade mini-badges, annotation, key stat highlight), runners-up list (2nd-5th place with rank, headshot, pos badge, name, key stat). 2-column card grid layout. Position filter tabs (All/QB/RB/WR/TE). Season selector. Click winner/runner → player profile. PNG export via html2canvas with watermark. Responsive at 768px (1-col) + 480px. /api/season-awards endpoint computes all 10 award categories from existing metrics: GPA percentiles, PPO, inverse CoV, SOS difficulty, opportunity share, dominator rating, GL TDs from player_season_pbp, 10th-percentile floor, age-weighted breakout score, stock delta. Min 6 games + 2 PPG filter. "Awards" nav link added to all 30 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 90 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/season-awards endpoint | DONE | 10 award categories, winner + 4 runners-up each, composite metrics |
| 2 | Season Superlatives dashboard page | DONE | 2-col card grid, trophy icons, grade badges, 21 escapeHtml, 163/163 balanced |
| 3 | Nav links + sitemap + analytics | DONE | All 30 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 30/30 nav links, XSS escaped, design compliance |

### Decisions Log
- **Season Superlatives as Phase 90**: After building 20+ individual metric dashboards and a composite Report Card (Phase 89), the natural next step is a "Fantasy Awards" page that crowns winners across all metric systems. This is the most screenshottable format for r/DynastyFF — "The 2024 Razzle Fantasy Awards" with trophy cards for MVP, Most Efficient, Iron Man, etc. Each award is a self-contained Reddit post. The card grid layout is visually distinct from the table-heavy dashboards, providing variety.
- **10 award categories**: Covers all major metric systems built across phases 82-89 (efficiency, consistency, SOS, opportunity share, dominator rating, stock score, breakout, red zone, floor). Each award uses a different primary sort key, ensuring different winners across categories — no single player sweeps everything.
- **Age-weighted breakout score**: Breakout Star uses 50% opportunity share percentile + 30% age bonus (younger = higher) + 20% PPG percentile. This naturally favors young, high-volume producers — exactly the breakout profile dynasty managers care about.
- **Schedule Survivor score**: 50% PPG percentile + 50% SOS difficulty percentile. This rewards players who produced at a high level despite facing the toughest defenses — the most "earned" production.

## Previous Phase: Phase 89 — Player Report Card Dashboard (COMPLETE)

**Exit criterion MET:** /reportcard.html page shows player report cards aggregating all Razzle grading systems into a composite "Fantasy GPA." Two sections: "Honor Roll" (highest composite GPA, top performers across all metrics) and "Needs Improvement" (lowest composite GPA among fantasy-relevant starters). Each player row: position badge, headshot, name, team, Fantasy GPA badge (A+ to F, 5-tier color-coded with B+/C+ granularity), Efficiency grade, Consistency grade, SOS grade, Stock Score (0-100), Opp Share %, Dominator Rating, PPG, Age, GP, Caveat annotation. Composite GPA = weighted average of efficiency percentile (20%), consistency percentile (20%), SOS percentile (20%), PPG percentile (20%), opportunity share percentile (20%). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/report-cards endpoint computes per-player efficiency (PPO), consistency (inv CoV), SOS difficulty, PPG, opportunity share, dominator rating, blends into composite GPA percentile → letter grade. Min 6 games + 2 PPG + 50 opps filter. "Report Card" nav link added to all 29 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 89 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/report-cards endpoint | DONE | Composite GPA, 5-dimensional percentile blend, honor_roll/needs_improvement split |
| 2 | Report Card dashboard page | DONE | Two-section table, GPA/grade/stock badges, 11 escapeHtml, balanced JS |
| 3 | Nav links + sitemap + analytics | DONE | All 29 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 29/29 nav links, XSS escaped, design compliance |

### Decisions Log
- **Player Report Card as Phase 89**: After building 20+ individual metric dashboards (efficiency, consistency, SOS, stocks, opportunity share, dominator rating, etc.), the natural culmination is a composite view that synthesizes ALL grades into a single "Fantasy GPA." This is the most screenshottable format for r/DynastyFF — "here's the full Razzle report card for [player]." The composite GPA gives a single number that captures the complete picture.
- **5-dimensional GPA weighting**: Equal 20% for efficiency (PPO), consistency (inv CoV), SOS difficulty, raw production (PPG), and volume (opp share). No single dimension dominates — the GPA rewards well-rounded players who are efficient, consistent, face tough schedules, produce, and get volume.
- **B+/C+ grade granularity**: Added B+ and C+ tiers to the grading scale for more resolution in the middle of the distribution. A+ remains at 95th percentile, F at below 25th.
- **Honor Roll / Needs Improvement framing**: School report card metaphor. Honor Roll = top 25 by GPA (the complete packages). Needs Improvement = bottom 25 (underperforming across metrics despite being fantasy-relevant starters). The framing is more actionable than generic "top/bottom."

## Previous Phase: Phase 88 — Opportunity Share & Dominator Rating Dashboard (COMPLETE)

**Exit criterion MET:** /opportunity.html page shows opportunity share analysis with two sections: "Alpha Dogs" (highest opportunity share — targets+carries as % of team total, min 30 opps + 4 games) and "Dominator Rating Leaders" (highest dominator rating — receiving yards share + receiving TD share of team totals for WR/TE, rush yards share for RB/QB). Each player: position badge, headshot, name, team, Opp Share % (color-coded badge: green>=25%, blue>=18%, yellow>=12%, orange>=8%, red<8%), Dominator Rating badge (green>=30, blue>=20, yellow>=12, orange>=6, red<6), Targets/G, Carries/G, Total Opps, PPG, GP, Caveat annotation. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/opportunity-share endpoint computes per-player opportunity share (targets+carries / team total), dominator rating (WR/TE: avg of rec yd share + rec TD share; RB/QB: rush yd share), targets/g, carries/g, PPG. Min 30 opportunities + 4 games filter. "Opportunity" nav link added to all 28 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 88 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/opportunity-share endpoint | DONE | Opp share, dominator rating, alpha_dogs/dominators split |
| 2 | Opportunity Share dashboard page | DONE | Two-section table, share/dom badges, 9 escapeHtml, 71/71 braces |
| 3 | Nav links + sitemap + analytics | DONE | All 28 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 28/28 nav links, XSS escaped, design compliance |

### Decisions Log
- **Opportunity Share & Dominator Rating as Phase 88**: After building 16+ analytical dashboards, opportunity share and dominator rating fill a key gap. "Who owns the touches?" (opportunity share) and "Who owns the production?" (dominator rating) are two of the most predictive metrics in dynasty fantasy football. Opportunity share tells you volume — dominator rating tells you conversion. Together they answer whether a player is truly the alpha on their team. Highly screenshottable for r/DynastyFF ("these players dominate their team's workload" / "highest dominator ratings by position").
- **Separate sections for volume vs production**: Alpha Dogs (opportunity share) rewards high-volume players who get the most touches regardless of efficiency. Dominator Rating Leaders rewards players who convert their opportunities into the largest share of team production. A player can be high in one but not the other — that's the insight.
- **Position-specific dominator calculation**: WR/TE use receiving dominator (rec yards + rec TDs share). RB/QB use rush dominator (rush yards share). This makes cross-position comparison meaningful since RBs don't compete for receiving production the same way.
- **Min 30 opps + 4 games**: 30 opportunities removes gadget players with 5 touches. 4 games ensures enough sample for meaningful team share calculation.

## Previous Phase: Phase 87 — Dynasty Stock Watch Dashboard (COMPLETE)

**Exit criterion MET:** /stocks.html page shows dynasty stock watch with two sections: "Rising Stocks" (players whose composite metrics exceed their PPG ranking — undervalued) and "Falling Stocks" (players whose PPG ranking exceeds their composite metrics — overvalued). For each player: position badge, headshot, name, team, Stock Score (0-100 color-coded badge: elite 80+ green, good 60-79 blue, avg 40-59 yellow, below 20-39 orange, poor <20 red), PPG, Efficiency grade, Consistency grade, SOS grade, Stock Delta, Age, GP, and Caveat annotation. Composite stock score = PPO percentile (25%) + inverse CoV percentile (25%) + SOS difficulty percentile (25%) + PPG percentile (25%). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/stock-watch endpoint computes per-player efficiency (PPO), consistency (CoV), SOS (avg opp PPG), and PPG, converts each to percentile, blends into 0-100 stock score, compares to PPG rank percentile, splits into rising (stock > PPG rank) and falling (stock < PPG rank). Min 6 games + 2 PPG + 50 opps filter. "Stocks" nav link added to all 27 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 87 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/stock-watch endpoint | DONE | Composite stock score, rising/falling split, grades |
| 2 | Stock Watch dashboard page | DONE | Two-section table, score badges, grade badges, 13 escapeHtml |
| 3 | Nav links + sitemap + analytics | DONE | All 27 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 27/27 nav links, XSS escaped, design compliance |

### Decisions Log
- **Dynasty Stock Watch as Phase 87**: After building 15+ individual metric dashboards (efficiency, consistency, SOS, usage, air yards, etc.), the natural culmination is a composite view that synthesizes them all. "Rising/falling stocks" is the most shared content format on r/DynastyFF. The composite score gives actionable buy/sell signals grounded in our data rather than opinions.
- **Equal 25% weighting**: PPO, inverse CoV, SOS difficulty, and PPG rank each get 25%. No metric dominates — the stock score is a balanced view of efficiency + consistency + schedule context + raw production.
- **Stock vs PPG rank comparison**: "Rising" means a player's multi-metric composite exceeds their PPG ranking (efficient + consistent + hard schedule = undervalued). "Falling" means their production rank overstates their underlying metrics.

## Previous Phase: Phase 86 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All HIGH findings from QA-AUDIT.md (Phases 81-85) resolved. SOS endpoint uses `full_name` instead of `display_name`. SOS endpoint includes `fantasy_relevant = 1` filter. MEDIUM fixes applied: efficiency YAC/Rec clamped to non-negative, consistency uses sample variance (Bessel's correction), efficiency column header "Y/Tch" renamed to "YPT", consistency CoV displayed as percentage (CoV%). All fixes verified with Python syntax checks and JS structure validation.

### Phase 86 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | HIGH fixes — SOS backend data issues | DONE | display_name→full_name, fantasy_relevant filter added |
| 2 | MEDIUM fixes — Backend computation | DONE | YAC clamp max(0,...), Bessel's correction (n-1) |
| 3 | MEDIUM fixes — Frontend labels | DONE | Y/Tch→YPT, CoV→CoV% with ×100 display |
| 4 | Smoke test | DONE | Python + JS syntax clean, all fixes verified |

### Decisions Log
- **QA+UX audit at Phase 85**: Triggered by phase 85 being a multiple of 5. Audited all files from phases 81-85. Found 2 HIGH backend issues (SOS name field + missing filter), 6 MEDIUM issues (computation + display), 5 LOW (no action needed). No CRITICALs — Phase 81 QA fixes resolved all prior CRITICALs effectively.

## Previous Phase: Phase 85 — Strength of Schedule Dashboard (COMPLETE)

**Exit criterion MET:** /schedule.html page shows strength of schedule analysis with two sections: "Schedule Suppressed" (players who faced the hardest schedules — buy targets with potentially suppressed stats) and "Schedule Inflated" (players who faced the easiest schedules — sell candidates with potentially inflated stats). For each player: position badge, headshot, name, team, actual PPG, SOS grade badge (A+ to F based on schedule difficulty percentile — A+ = hardest schedule), SOS Rank (1=hardest), Avg Opp PPG Allowed, Delta badge (green=hard schedule, red=easy schedule), GP, and Caveat annotation. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/strength-of-schedule endpoint computes defense PPG-allowed-by-position grid, then per-player average opponent PPG allowed across all weeks played, sos_delta = league_avg - avg_opp_ppg (positive = harder than average), grades by schedule difficulty percentile, splits into schedule_suppressed (hardest SOS) and schedule_inflated (easiest SOS). Min 6 games + 2 PPG filter. "Schedule" nav link added to all 26 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 85 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/strength-of-schedule endpoint | DONE | Defense PPG-allowed grid, per-player SOS, sos_delta, grades by percentile |
| 2 | Strength of Schedule dashboard page | DONE | Two-section table, SOS grade badges, delta badges, sortable, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 26 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 26/26 nav links verified, XSS escaped, design compliance confirmed |

### Decisions Log
- **Strength of Schedule as Phase 85**: SOS is one of the most debated topics in fantasy football — "was he actually good or did he just have easy matchups?" By computing the average PPG-allowed-at-position by each player's actual opponents, we can quantify schedule difficulty and identify players whose stats were suppressed (buy low) or inflated (sell high). Highly screenshottable for r/DynastyFF ("these players produced despite the hardest schedules" / "these stats were schedule-inflated").
- **sos_delta as primary metric**: The delta between league-average PPG-allowed and a player's actual opponent average makes cross-position comparison meaningful. A positive delta means harder-than-average schedule.
- **Grade inverted (A+ = hardest schedule)**: A+ for hardest schedule faced rewards the players who overcame the most difficulty. This makes the "Schedule Suppressed" section feel like a badge of honor.
- **Defense PPG-allowed as SOS basis**: Using actual fantasy points allowed by opponents (from player_week_stats grouped by opponent_team) is more accurate than generic team strength metrics because it's position-specific.

## Previous Phase: Phase 84 — Consistency Rankings Dashboard (COMPLETE)

**Exit criterion MET:** /consistency.html page shows fantasy consistency rankings with two sections: "Rock Solid" (lowest coefficient of variation, most consistent week-to-week scorers) and "Wild Cards" (highest coefficient of variation, most volatile scorers). Each player row shows: position badge, headshot, name, team, PPG, StdDev, CoV (coefficient of variation = StdDev/PPG), Floor (10th percentile weekly score), Ceiling (90th percentile weekly score), Range (Ceiling - Floor), consistency grade badge (A+ to F based on inverse CoV percentile — lower CoV = higher grade), GP, and Caveat annotation. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/consistency-rankings endpoint queries player_week_stats for weekly fantasy_points_ppr per player, computes mean/stddev/CoV/floor(10th pctile)/ceiling(90th pctile)/range, grades by inverse CoV percentile (A+ = most consistent >= 95th, F = least consistent < 25th), splits into rock_solid and wild_cards. Min 6 games + 2 PPG filter. "Consistency" nav link added to all 25 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 84 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/consistency-rankings endpoint | DONE | PPG, StdDev, CoV, Floor, Ceiling, Range, grade by inverse CoV percentile |
| 2 | Consistency dashboard page | DONE | Two-section table, grade badges, sortable, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 25 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 25/25 nav links verified, XSS escaped, design compliance confirmed |

### Decisions Log
- **Consistency Rankings as Phase 84**: Week-to-week consistency is one of the most debated topics in dynasty fantasy football — "is this player a safe floor play or a volatile boom/bust?" The coefficient of variation (StdDev/PPG) is the cleanest consistency metric because it normalizes for scoring volume. A player averaging 20 PPG with 5 StdDev is more consistent than one averaging 10 PPG with 5 StdDev. Highly screenshottable for r/DynastyFF ("most consistent fantasy players by position" / "these players are weekly rollercoasters").
- **CoV as primary metric**: Coefficient of variation normalizes variance by scoring level, making cross-position comparisons meaningful. Raw standard deviation favors low scorers as "consistent" (a player scoring 2 PPG every week has low StdDev but isn't useful).
- **Inverse CoV for grading**: Lower CoV = more consistent = higher grade. A+ goes to the most predictable scorers. This is intuitive — you want your "Rock Solid" players graded A+.
- **Min 6 games + 2 PPG**: 6 games gives enough weeks for meaningful variance calculation. 2 PPG floor removes irrelevant players who are "consistent" at scoring nothing.
- **Floor/Ceiling as 10th/90th percentile**: More robust than min/max which are heavily influenced by single outlier weeks. The 10th percentile floor tells you "in 9 out of 10 weeks, you'll get at least this much."

## Previous Phase: Phase 83 — Fantasy Efficiency Dashboard (COMPLETE)

**Exit criterion MET:** /efficiency.html page shows fantasy efficiency rankings with two sections: "Most Efficient" (highest fantasy points per opportunity, min 50 opportunities) and "Volume Kings" (most total opportunities with efficiency grade). Each player row shows: position badge, headshot, name, team, PPO (fantasy points per opportunity), Yards/Touch, Catch Rate, YAC/Rec, TD Rate per Touch, total opportunities, fantasy PPG, GP, efficiency grade badge (A+ to F based on PPO percentile, color-coded: A+/A green, B blue, C yellow, D orange, F red). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/efficiency-rankings endpoint queries player_week_stats for targets/carries/receptions/yards/air yards/TDs/fantasy points, computes PPO/YPT/catch rate/YAC per rec/TD rate, grades by PPO percentile, splits into most_efficient and volume_kings. Min 4 games + 50 opportunities filter. "Efficiency" nav link added to all 24 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 83 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/efficiency-rankings endpoint | DONE | PPO, YPT, catch rate, YAC/rec, TD rate, grade by percentile |
| 2 | Efficiency dashboard page | DONE | Two-section table, grade badges, sortable, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 24 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 24/24 nav links verified, XSS escaped, design compliance confirmed |

### Decisions Log
- **Fantasy Efficiency as Phase 83**: Efficiency metrics (fantasy points per opportunity, yards per touch) are the core analytical lens that separates casuals from dynasty power users. "Who does more with less?" is one of the most debated questions in dynasty circles. The two-section approach (Most Efficient = quality, Volume Kings = quantity) gives both sides of the coin. Highly screenshottable for r/DynastyFF ("most efficient fantasy players by PPO" / "these players get all the opportunities").
- **PPO as primary metric**: Fantasy Points per Opportunity (targets + carries) is the cleanest efficiency metric because it accounts for both passing and rushing volume. Unlike yards per touch, PPO includes TD value and PPR bonus, making it directly comparable across positions.
- **Efficiency grades A+ to F**: Percentile-based grading makes efficiency immediately understandable without needing to know what a "good PPO" is. The letter grade is instantly recognizable — A+ jumps off the page.
- **50 opportunity minimum**: Prevents small-sample noise from backup players with 2 catches for 80 yards appearing as "most efficient." 50 opportunities ensures meaningful sample size for efficiency evaluation.

## Previous Phase: Phase 82 — Red Zone & Goal-Line Dashboard (COMPLETE)

**Exit criterion MET:** /redzone.html page shows goal-line usage leaders with two sections: "Goal-Line Dominators" (most GL opportunities, min 3) and "TD Dependent" (highest TD% of fantasy scoring, min 2 TDs). Dominators table shows: player (headshot, name, pos badge, team), GL Opp, GL Carries, GL Targets, GL TDs, GL TD% (color-coded badge: green>=50%, yellow>=25%, red<25%), total TDs, PPG, GP, Caveat annotations. TD Dependent table shows: player, TD% of fantasy points (color-coded badge: red>=50% heavy, orange>=35% moderate, green<35% light), total TDs, Rush TDs, Rec TDs, PPG, GL TDs, GL Opp, GP, Caveat annotations. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/redzone-usage endpoint queries player_week_stats for fantasy points + TDs + games, joins player_season_pbp for gl_carries/gl_targets/gl_tds, computes gl_td_rate and td_pct_of_fantasy. Min 4 games filter. "Red Zone" nav link added to all 23 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 82 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/redzone-usage endpoint | DONE | GL stats from player_season_pbp, TD% computed, dominators + td_dependent split |
| 2 | Red Zone dashboard page | DONE | Two-section table, GL TD% badges, TD% badges, sortable, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 23 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 23/23 nav links verified, XSS escaped, design compliance confirmed |

### Decisions Log
- **Red Zone & Goal-Line as Phase 82**: Goal-line usage is one of the most discussed topics in fantasy football — "who's getting the carries inside the 5?" directly predicts TD upside. The two-section approach (Dominators = who gets the opportunities, TD Dependent = who needs TDs to produce) gives both actionable and cautionary insights. Highly screenshottable for r/DynastyFF ("these RBs own the goal line" / "these players are TD-or-bust").
- **Goal-line (inside 5) vs red zone (inside 20)**: Used goal-line data (inside 5-yard line) from player_season_pbp rather than broader red zone data because it's more predictive of actual TD scoring and more actionable. The 5-yard line is where TDs happen.
- **TD% of fantasy as dependency metric**: Calculating what percentage of a player's fantasy points come from touchdowns reveals floor risk — a player with 55% TD dependency has a fragile fantasy floor that collapses in weeks without scores.
- **Color-coded badges**: GL TD% uses green/yellow/red (conversion efficiency), TD% uses red/orange/green (higher = riskier dependency). Different color semantics for different meanings.

## Previous Phase: Phase 81 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from phases 76-80 QA+UX audit resolved. usage.html `window` parameter shadow fixed (renamed to `trendWindow`). Analytics pageview tracking fixed on yoy/airyards/explorer (replaced nonexistent `trackPageview()` with inline fetch). app.js load order fixed in usage.html (moved before inline script). XSS in explorer.html tooltip escaped + formatted. Air yards column headers all have title tooltips (WOPR, RACR, aDOT, AY%, Regr explained). Explorer dot click opens in new tab, cursor changes to pointer on hover. Usage H1 renamed to "Usage Trends" to match nav. QB position badge CSS added to airyards.html. Explorer event listener leak fixed. Matchups legend swatch border 1px→2px. PNG export watermark added to yoy/airyards/explorer. Air yards subtitle clarifies "pass catchers (WR/RB/TE)". Explorer axis selects pre-populated with defaults. Usage Delta header has tooltip.

### Phase 81 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CRITICAL fixes | DONE | window shadow, Reg→Regr + tooltips |
| 2 | HIGH QA fixes | DONE | analytics pageview, app.js order, XSS escape |
| 3 | HIGH UX fixes | DONE | column tooltips, cursor/click behavior, H1 mismatch |
| 4 | MEDIUM fixes | DONE | QB badge, listener leak, 1px border, watermarks, subtitle, placeholders, Delta tooltip |
| 5 | Smoke test | DONE | Python + JS syntax clean, all fixes verified |

## Previous Phase: Phase 80 — Stat Explorer (COMPLETE)

**Exit criterion MET:** /explorer.html page shows an interactive scatter plot where users can select any two metrics for X and Y axes from dropdown menus (17 metrics: PPG, Targets/G, Rec/G, Rec Yards/G, Rush Yards/G, Carries/G, Air Yards/G, TDs, Age, Snap%, aDOT, Catch Rate, RACR, Target Share, Air Yards Share, WOPR, Games). Each dot is a player, color-coded by position (QB blue, RB teal, WR terracotta, TE purple). Hover tooltip shows player name, team, and both stat values. Click dot → player profile. Canvas-drawn scatter with axis labels, gridlines, nice tick values, and linear regression trendline (dashed terracotta). Position filter tabs (All/QB/RB/WR/TE). Season selector. Resize handler redraws on window resize. PNG export via html2canvas with watermark. Error state with retry button. /api/stat-explorer endpoint returns player data with any two requested stats. Min 4 games filter. Rate metrics (target_share, air_yards_share, wopr) enriched from player_week_metrics only when needed. "Explorer" nav link added to all 22 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations.

### Phase 80 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/stat-explorer endpoint | DONE | 17 metrics, per-game + rate metric enrichment, min 4 games |
| 2 | Scatter plot page | DONE | Canvas scatter, axis dropdowns, hover tooltip, trendline, click→profile |
| 3 | Nav links + sitemap + analytics | DONE | All 22 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 22/22 nav links verified, design compliance confirmed |

### Decisions Log
- **Stat Explorer as Phase 80**: The ability to plot any two stats against each other is quintessentially Bloomberg-terminal. It lets users discover relationships that predefined dashboards don't surface — "who has high aDOT but low PPG?" or "targets/game vs RACR" to find efficiency outliers. Each scatter plot is a unique screenshot opportunity for r/DynastyFF.
- **Canvas-drawn scatter**: Canvas gives us full control over the visualization — dot sizes, hover detection, trendlines, gridlines. No charting library needed. Keeps the bundle size at zero (no additional dependencies).
- **17 metrics**: Covers all major fantasy-relevant stats from both the core player_week_stats table and the player_week_metrics rate table. Adding new metrics later just means adding to the EXPLORER_METRICS list.
- **Linear regression trendline**: Shows the overall relationship direction at a glance. Dashed terracotta to match the brand accent without overwhelming the data points.
- **On-demand rate metric enrichment**: Only queries player_week_metrics when the user selects a rate metric (target_share, air_yards_share, wopr). This avoids unnecessary DB work for core stat pairs.

## Previous Phase: Phase 79 — Air Yards Dashboard (COMPLETE)

**Exit criterion MET:** /airyards.html page shows an air yards analytics dashboard for pass catchers (WR/RB/TE). Two sections: "Buy Low" (high air yards rank, underperforming in PPG — positive regression candidates) and "Sell High" (low air yards rank, overperforming in PPG — negative regression candidates). Each player row shows: position badge, headshot, name, team, Tgt/G, total air yards, AY/G, aDOT, AirYd%, WOPR, RACR, PPG, regression delta badge (green=buy low, red=sell high), GP, and Caveat annotations. Position filter tabs (All/WR/RB/TE — no QB). Season selector. Sortable column headers with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Color legend for regression indicator. Error state with retry button. Responsive at 768px + 480px with hide-mobile columns. /api/air-yards endpoint queries player_week_stats for receiving_air_yards + targets, enriches with air_yards_share/wopr/target_share from player_week_metrics, computes aDOT and RACR, ranks by air yards vs PPG, and splits into buy_low (delta >3) and sell_high (delta <-3). Min 4 games + 10 targets filter. "Air Yards" nav link added to all 21 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 79 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/air-yards endpoint | DONE | Air yards + rate metrics query, regression delta ranking, buy_low/sell_high split |
| 2 | Air Yards dashboard page | DONE | Two-section table (buy low/sell high), sortable columns, regression badges, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 21 pages updated (40 total refs), sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 21/21 nav links verified, design compliance confirmed |

### Decisions Log
- **Air Yards Dashboard as Phase 79**: Air yards are one of the most discussed advanced metrics in dynasty fantasy football. The gap between a player's air yards ranking and their PPG ranking is one of the most reliable regression indicators — a player with lots of air yards but low PPG is likely to improve (buy low), while a player with high PPG but low air yards is likely to regress (sell high). This is the kind of analysis that gets screenshotted and shared on r/DynastyFF ("these WRs are due for a breakout based on air yards").
- **Regression delta as primary signal**: Rather than just showing raw air yards leaderboards (which users can already see in the Lab screener), the unique value is the regression indicator — the delta between air yards rank and PPG rank. This surfaces actionable insight that raw stats don't.
- **No QB filter**: Air yards metrics for QBs (passing_air_yards) tell a different story than for receivers. This dashboard focuses specifically on pass catchers where air yards directly predict individual production. QBs have their own metrics (aDOT as a passer, CPOE, etc.).
- **Min 10 targets filter**: Combined with 4-game minimum, this prevents noise from players with tiny sample sizes who happen to have extreme aDOT or RACR values.

## Previous Phase: Phase 78 — Year-over-Year Comparison (COMPLETE)

**Exit criterion MET:** /yoy.html page shows year-over-year stat comparisons between two adjacent seasons. Two sections: "Risers" (players who improved most) and "Fallers" (players who declined most). Each player row shows: position badge, headshot, name, team, previous season value, current season value, delta arrow+value (green up / red down), mini-deltas for other key metrics, games played (prev→curr), and Caveat annotations. Metric selector to sort by different delta categories (PPG, Targets/G, Rec Yards/G, Rush Yards/G, Total TDs, Snap%). Season pair selector (e.g., "2024 vs 2023"). Position filter tabs (All/QB/RB/WR/TE). Click player row → player profile. PNG export via html2canvas with watermark. Error state with retry button. Responsive at 768px + 480px with hide-mobile columns. /api/year-over-year endpoint computes per-game stats for two adjacent seasons per player, calculates deltas, returns risers (delta > 0.5) and fallers (delta < -0.5) sorted by chosen metric. Min 4 games per season filter. "YoY" nav link added to all 20 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 78 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/year-over-year endpoint | DONE | Per-game stats for two seasons, deltas for 6 metrics, risers/fallers split |
| 2 | Year-over-year page | DONE | Two-section table (risers/fallers), metric selector, mini-deltas, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 20 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 20/20 nav links verified, design compliance confirmed |

### Decisions Log
- **Year-over-Year as Phase 78**: "Who improved and who fell off?" is one of the most common dynasty trade evaluation questions. Year-over-year stat deltas contextualize whether a player is ascending or declining — critical for buy-low/sell-high decisions. Highly screenshottable for r/DynastyFF ("biggest YoY risers heading into 2025").
- **Multi-metric selector**: Different metrics tell different stories. PPG delta is the headline, but target/game delta reveals opportunity changes, yard/game delta shows efficiency shifts, and snap% delta shows coaching trust. Letting users toggle between these creates multiple screenshot angles.
- **Mini-deltas for secondary metrics**: Showing all metric deltas in the same row (compactly) gives full context at a glance without needing to switch views. The primary metric is large, others are small inline chips.
- **Min 4 games filter**: Prevents small-sample noise. A player with 2 games inflated by one boom week shouldn't show as a "breakout year."

## Previous Phase: Phase 77 — Snap Count & Usage Trends (COMPLETE)

**Exit criterion MET:** /usage.html page shows snap count usage trends with Risers and Fallers sections. Table format with player rows showing headshot, name, position badge, team, current snap%, season average snap%, delta arrow+value (green up / red down), inline canvas sparkline bars showing weekly snap% history, games played, and Caveat annotations. Configurable window (3/5/8 weeks). Position filter tabs (All/QB/RB/WR/TE). Season selector. Click player row → player profile. PNG export via html2canvas with watermark. Error state with retry button. Responsive at 768px + 480px with hide-mobile columns. /api/usage-trends endpoint computes weekly snap% trends from offense_pct in player_week_stats, splits into risers (delta > 2%) and fallers (delta < -2%). "Usage" nav link added to all 19 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 77 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/usage-trends endpoint | DONE | Weekly snap% trends, risers/fallers split, window/position/season params |
| 2 | Usage trends page | DONE | Two-section table (risers/fallers), canvas sparklines, delta arrows, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 19 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 19/19 nav links verified, design compliance confirmed |

### Decisions Log
- **Snap Count Trends as Phase 77**: "Who's gaining/losing snaps?" is one of the most actionable pieces of fantasy intelligence. Rising snap counts are among the best predictive signals for future production. This dashboard surfaces the signal that power users manually track — highly screenshottable for r/DynastyFF.
- **Table format over cards**: Usage trends are inherently comparative — seeing 20-30 players' snap trajectories at once is more useful than individual cards. Tables compress better for screenshots.
- **Canvas sparklines**: Inline mini bar charts give instant visual read on the trend direction without needing a separate chart page. Color-coded (green=rising, red=falling) matches the delta arrows.
- **Window selector (3/5/8 weeks)**: Different time horizons matter — 3 weeks catches recent changes, 5 weeks is the default balanced view, 8 weeks shows sustained trends. All computed from the same data.
- **Delta threshold of 2%**: Filters out noise. Only shows players with meaningful snap% changes (>2% delta between first and second half of the window).

## Previous Phase: Phase 76 — Matchup Heatmap (COMPLETE)

**Exit criterion MET:** /matchups.html page shows a color-coded 32-team x 4-position heatmap grid of average fantasy points allowed per game (PPR). Green gradient = easy matchup (defense allows lots of points), red gradient = hard matchup (defense allows few points). 5-tier color scale using positional percentiles (p20/p40/p60/p80). Each cell shows avg PPG allowed and rank number. Caveat annotations ("cake", "soft", "tough", "avoid") on extreme matchups. Click cell in ALL mode → switches to position mode; in position mode → shows top 5 scorers detail panel with headshots. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable column headers (team, per-position, total). PNG export via html2canvas with watermark. Color legend. Responsive at 768px + 480px. /api/matchup-heatmap endpoint computes from opponent_team field in player_week_stats. "Matchups" nav link added to all 18 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 76 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/matchup-heatmap endpoint | DONE | Avg PPR allowed per game by defense per position, ranks, detail view |
| 2 | Matchups heatmap page | DONE | 5-tier color grid, cell click detail, sort, annotations, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 18 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 18/18 nav links verified, design compliance confirmed |

### Decisions Log
- **Matchup Heatmap as Phase 76**: "Which defenses give up the most points?" is a fundamental fantasy question asked every single week. Matchup heatmaps are among the most screenshotted content on r/fantasyfootball during the season. Having this as a standalone dashboard adds a high-value tool that complements the existing analytics suite.
- **5-tier color scale**: Using positional percentiles (p20/p40/p60/p80) ensures the color coding is meaningful relative to each position. QB averaging 22 PPG allowed and RB averaging 14 PPG both appear "green" if they're top-quartile for their position.
- **Click-through detail**: In ALL mode, clicking a cell switches to position mode for that position. In position mode, clicking shows top 5 scorers against that defense — lets users understand WHY a defense is easy/hard.
- **Opponent_team field**: nflverse provides opponent_team on every player_week_stats row, so we can compute points allowed by simply summing fantasy_points_ppr grouped by opponent_team and position. No additional data needed.
- **Annotations**: "cake" (rank 1-3), "soft" (4-6), "tough" (bottom 6), "avoid" (bottom 3) — adds personality without cluttering the heatmap.

## Previous Phase: Phase 75 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from phases 71-75 QA+UX audit resolved. Canvas XSS pattern fixed (aging.html). Fetch resp.ok checks added (weekly+targets). app.js added (weekly+targets). Carries mode re-sort fixed (targets). Nav overflow handled with flex-wrap + mobile scroll. Weekly heatmap column sorting added. aria-labels on all tabs. "peak age" label fixed. Heat legend shows numeric thresholds. GP column added to weekly. try/except on 3 server endpoints. FANTASY_POSITIONS constant consistency. Retry buttons on error states. Aging subtitle clarifies curve vs dots data.

### Phase 75 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CRITICAL + HIGH QA fixes | DONE | Canvas plain text, resp.ok, app.js, carries sort, name labels |
| 2 | HIGH UX fixes | DONE | Nav flex-wrap+scroll, heatmap column sorting |
| 3 | MEDIUM QA fixes | DONE | aria-labels, peak age, heat thresholds, try/except, FANTASY_POSITIONS |
| 4 | MEDIUM UX fixes | DONE | GP column, aging subtitle, retry buttons |
| 5 | Smoke test | DONE | All syntax valid, all fixes verified |

## Previous Phase: Phase 74 — Team Target Distribution (COMPLETE)

**Exit criterion MET:** /targets.html page shows team-by-team target and carry distribution as stacked horizontal bars (treemap-style). Each team card shows player segments sized by target/carry share, color-coded by position (QB blue, RB teal, WR terracotta, TE purple). Targets/Carries mode toggle. Player name labels on segments >8%. Player detail rows with position badge, name, count, share%. Team selector dropdown. Season selector. Caveat annotations ("owns this target tree", "spread it around"). Click player segment or row → player profile. PNG export with watermark. Position color legend. "Targets" nav link added to all 17 HTML pages (nav + footer). Sitemap entry added. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 74 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/target-distribution endpoint | DONE | Per-team player targets/carries, shares, top 8 per team |
| 2 | Target distribution page with bars | DONE | Stacked bars, mode toggle, annotations, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 17 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 18/18 design checks, nav links verified |

### Decisions Log
- **Target Distribution as Phase 74**: "Where do the targets go?" is a fundamental dynasty question. Target distribution by team shows opportunity share at a glance — critical for evaluating landing spots pre-draft and identifying opportunity vacuums. Highly screenshottable.
- **Stacked horizontal bars**: Treemap-style bars make share distribution instantly visual. Position-colored segments let you see at a glance which positions dominate each team's passing game.
- **Targets/Carries mode toggle**: Both target distribution AND carry distribution matter. Separate modes let users switch context without cluttering one view.
- **Top 8 per team**: Prevents clutter from practice squad players with 1-2 targets. Shows the meaningful usage tree.
- **Caveat annotations**: "Owns this target tree" for dominant players (>30% share), "leads the way" (>22%), "spread it around" for balanced attacks. Adds the personality without cluttering.

## Previous Phase: Phase 73 — Weekly Scoring Heatmap (COMPLETE)

**Exit criterion MET:** /weekly.html page shows a color-coded grid of player weekly fantasy scores (rows = players, columns = weeks). Cells color-coded in 5 tiers from red (bad) to green (good) based on positional percentile thresholds. Position filter tabs (All/QB/RB/WR/TE). Season selector. Click player name → player profile. PNG export with watermark. Color legend (cold → hot). Bye weeks shown. Sticky player column. "Weekly" nav link added to all 16 HTML pages (nav + footer). Sitemap entry added. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 73 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/weekly-heatmap endpoint | DONE | Per-week PPR scores, positional percentile thresholds, season/position/limit params |
| 2 | Weekly heatmap grid page | DONE | 5-tier color coding, sticky player col, bye weeks, hover highlight, responsive |
| 3 | Nav links + sitemap + analytics | DONE | All 16 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 18/18 design checks, nav links verified |

### Decisions Log
- **Weekly Scoring Heatmap as Phase 73**: Weekly scoring grids are among the most screenshotted fantasy content on r/DynastyFF and r/fantasyfootball. "Look at X's consistency" or "see how Y boomed Weeks 10-14" drives engagement. Table-based heatmap is more information-dense than charts and perfect for Reddit screenshots.
- **5-tier color scale**: Positional percentiles at p20/p40/p60/p80 create meaningful breaks. Red=bust, yellow=below avg, sand=average, light green=good, strong green=elite. Using positional thresholds means QB 18pts and RB 12pts both show as "good" relative to their position.
- **Sticky player column**: With 18 weeks of data, horizontal scroll is inevitable. Sticky player names ensure the heatmap stays readable.
- **Table over canvas**: Unlike aging curves, the heatmap is fundamentally tabular data. HTML tables give better accessibility, click targets, hover states, and responsive behavior than canvas.
- **Bye week display**: Showing "bye" in faint text instead of blank cells prevents confusion about missing data vs. zero-score weeks.

## Previous Phase: Phase 72 — Aging Curves Dashboard (COMPLETE)

**Exit criterion MET:** /aging.html page shows position-specific aging curves (PPG by age) as canvas-drawn line charts with individual player dots plotted. Summary cards show peak age per position. Position filter tabs (All/QB/RB/WR/TE). Season selector. Click player dot → player profile. PNG export with watermark. Legend explaining curve vs dots. Canvas redraws on resize. "Aging" nav link added to all 15 HTML pages (nav + footer). Sitemap entry added. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

### Phase 72 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/aging-curves endpoint | DONE | Aggregate PPG-by-age curves + individual player dots, season/position params |
| 2 | Canvas aging curve charts | DONE | Filled area, curve line, player dots, peak marker, tooltips, click→profile |
| 3 | Nav links + sitemap + analytics | DONE | All 15 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 18/18 design checks, nav links verified |

### Decisions Log
- **Aging Curves as Phase 72**: Dynasty managers constantly debate when players peak and decline. Aging curve visualizations are among the most screenshotted content on r/DynastyFF. Making them interactive with real data and individual player dots makes them far more useful than static images.
- **Multi-season aggregate curve**: The curve averages PPG by age across ALL available seasons (2020+) for statistical robustness. Individual dots show the selected season only. This gives the curve real shape with enough sample size while showing current players.
- **Age adjustment**: Player ages in the DB are current age. For historical seasons, we subtract (latest_season - that_season) to estimate their age at the time. Not perfect (birthday timing) but close enough for curve shape.
- **Canvas rendering**: Canvas gives pixel-perfect control over the chart aesthetic — filled area under curve, dashed peak marker, semi-transparent dots — matching the comic-strip style better than any chart library.
- **Min 6 games filter**: Prevents small-sample noise from distorting the curve and individual dots.

## Previous Phase: Phase 71 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from phases 66-70 QA+UX audit resolved. Nav class fixed on scarcity/breakouts/buysell (main-nav → topnav with tiger logo). Connection leak fixed in fetch_prospect_scores (try/finally). XSS fixed: all numeric API values escaped in breakouts/buysell/scarcity innerHTML. Prospect click improved with position filter param. RBS/RPS tooltips added. Age badges standardized (young ≤24, prime 25-27, aging 28+). Scarcity summary labels improved (PPG units, ranked scarcity labels). Breakouts vs Buy/Sell subtitles clarified. Medium: LIMIT 500 on SQL queries, position validation on prospect-scores, aria-labels on season selects.

### Phase 71 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CRITICAL + HIGH QA fixes | DONE | Nav class, connection leak, XSS escaping |
| 2 | Prospects click navigation | DONE | Added position filter, name-based search correct for combine data |
| 3 | HIGH UX fixes | DONE | Tooltips, age badges, labels, page differentiation |
| 4 | MEDIUM fixes | DONE | LIMIT 500, position validation, aria-labels |
| 5 | Smoke test | DONE | All syntax valid, all fixes verified |

## Previous Phase: Phase 70 — Buy Low / Sell High Dashboard (COMPLETE)

**Exit criterion MET:** /buysell.html page shows two columns: Buy Low candidates (high efficiency, low dynasty rank) and Sell High candidates (low efficiency, high dynasty rank). Each player rendered as a comic-strip card with position-colored top stripe, rank, headshot, name, position badge, team, age badge (young/prime/aging/veteran), efficiency grade badge (A+ to F, color-coded), value mismatch bar, Caveat annotation, and position-specific efficiency stats (QB: Y/A, TD%, INT%; RB: YPC, Y/TGT, TD%; WR/TE: Y/TGT, Catch%, YAC/R, TD%). Position filter tabs (All/QB/RB/WR/TE). Season selector dropdown. PNG export via html2canvas with watermark. Click card → player profile. "Buy/Sell" nav link added to all 14 HTML pages (nav + footer). Sitemap updated. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, hand annotations, position colors.

### Phase 70 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend buy-sell-candidates endpoint | DONE | GET /api/buy-sell-candidates, position-specific efficiency, dynasty value comparison, age amplifier |
| 2 | Buy/Sell page with two-column layout | DONE | Buy Low (green) / Sell High (red), efficiency grades, mismatch bars, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 14 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 16/16 design checks, XSS safe |

### Decisions Log
- **Buy Low / Sell High as Phase 70**: With dynasty trade season in full swing pre-draft, identifying value mismatches is core content for r/DynastyFF. "Buy low on X, sell high on Y" is the most common dynasty discussion format. Making these debates data-driven and screenshottable.
- **Efficiency vs dynasty rank percentile**: Comparing efficiency percentile (within position) against dynasty value rank percentile reveals true mismatches. A player can have elite efficiency but low dynasty value (buy) or high dynasty value but mediocre efficiency (sell).
- **Position-specific efficiency metrics**: QB uses Y/A + TD% - INT%. RB uses YPC + Y/TGT + TD%. WR/TE uses Y/TGT + Catch% + YAC/R + TD%. Each position's efficiency is measured by the stats that matter most for that role.
- **Age amplifier**: Young buy lows get a boost (more upside), old sell highs get a boost (more decline risk). Makes the signals dynasty-relevant, not just redraft.
- **10-point mismatch threshold**: Prevents marginal candidates from cluttering the lists. Only meaningful mismatches qualify.
- **Two-column layout**: Side-by-side Buy/Sell makes the page immediately scannable and highly screenshottable. Green up-arrow vs red down-arrow gives instant visual signal.

## Previous Phase: Phase 69 — Breakout Candidate Finder (COMPLETE)

**Exit criterion MET:** /breakouts.html page shows top breakout candidates ranked by Razzle Breakout Score (RBS) measuring the gap between opportunity metrics (snap%, target share, carries, air yards) and production (PPG). Each candidate rendered as a comic-strip card with position-colored top stripe, rank badge, headshot, name, position badge, team, age badge (young/prime/aging), RBS score, opportunity vs production horizontal bars, Caveat annotation, and key stats (PPG, snap%, position-specific usage, games). Position filter tabs (All/QB/RB/WR/TE). Season selector dropdown. PNG export via html2canvas with watermark. Click card → player profile. "Breakouts" nav link added to all 13 HTML pages (nav + footer). Sitemap updated. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, hand annotations, position colors.

### Phase 69 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend breakout-candidates endpoint | DONE | GET /api/breakout-candidates, position-specific opportunity weighting, age bonus, RBS scoring |
| 2 | Breakouts page with candidate cards | DONE | Opportunity vs production bars, annotations, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 13 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 14/14 design checks, XSS safe |

### Decisions Log
- **Breakout Score algorithm**: Opportunity percentile (within position) minus production percentile, plus age bonus. Position-specific opportunity weights: QB uses snap% + attempts/game, RB uses snap% + carries/game + targets/game, WR/TE uses snap% + target_share + air_yards/game. Bigger gap = more breakout potential.
- **Age ≤27 cutoff**: Dynasty breakout candidates are young players who haven't peaked yet. 27 is the reasonable ceiling for "breakout" — older players with opportunity gaps are more likely declining, not breaking out.
- **6+ games minimum**: Ensures enough sample size. Filters out injured players and late-season additions who would create noise.
- **Visual: opportunity vs production bars**: Two horizontal bars make the "gap" immediately visible and screenshottable. Green for opportunity, gray for production — the space between them IS the story.

## Previous Phase: Phase 68 — Positional Scarcity Dashboard (COMPLETE)

**Exit criterion MET:** /scarcity.html page shows PPG drop-off curves for each position (QB, RB, WR, TE) as bar charts with position-colored fills. Scarcity summary cards at top ranked by drop-off (most scarce to most replaceable). Each position card shows player bars from rank 1 to rank N with tier break dividers and Caveat annotations ("the starter line", "the RB cliff", "the TE premium cliff"). Season selector dropdown. PNG export via html2canvas with watermark. Click bar → player profile. "Scarcity" nav link added to all 12 HTML pages (nav + footer). Sitemap updated. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, hand annotations, position colors.

### Phase 68 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend positional-scarcity endpoint | DONE | GET /api/positional-scarcity, PPG by position, tier breaks, scarcity scores |
| 2 | Scarcity page with drop-off charts | DONE | Bar charts, summary cards, tier breaks, responsive, PNG export |
| 3 | Nav links + sitemap + analytics | DONE | All 12 pages updated, sitemap entry, pageview tracking |
| 4 | Smoke test | DONE | Python + JS syntax clean, 14/14 design checks, XSS safe |

### Decisions Log
- **Positional Scarcity as Phase 68**: With draft season approaching, showing PPG drop-off by position is core dynasty analytics content. "How scarce is TE?" and "Where's the RB cliff?" are questions r/DynastyFF debates constantly. This makes those debates screenshottable.
- **Bar charts over line charts**: Stepped bar charts with player names make it actionable — you can see exactly WHO is at each rank, not just a line. More information density, more screenshottable.
- **Summary cards ranked by drop-off**: Leading with "most scarce" to "most replaceable" gives the headline insight immediately. No need to compare charts manually.
- **Standard league thresholds**: QB1-12, RB1-24, WR1-36, TE1-12 maps to a 12-team league with standard roster construction. These are the thresholds dynasty players think in.

## Previous Phase: Phase 67 — Rookie Big Board (COMPLETE)

**Exit criterion MET:** /prospects.html page shows all prospects ranked by Razzle Prospect Score (RPS), grouped into 4 tiers (Elite 80+, Premium 60-79, Solid 40-59, Raw <40). Each prospect card shows rank, position badge (color-coded), name, school, draft round/pick chip, height/weight, and combine percentile mini-bars (40yd, Vert, Broad, Bench, 3Cone, Shuttle) with color-coded fills (green 80%+, blue 60%+, yellow 40%+, orange 20%+, red <20%). RPS score displayed prominently. Position filter tabs (All/QB/RB/WR/TE) with segmented control. Draft year selector dropdown. PNG export via html2canvas with watermark. Click card → Lab prospect search. "Prospects" nav link added to all 11 HTML pages (nav + footer). Sitemap updated. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, hand annotations, position colors.

### Phase 67 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Build prospects.html with tiered cards | DONE | RPS tiers, percentile bars, position filters, year selector, PNG export |
| 2 | Nav links + sitemap + analytics | DONE | All 11 pages updated, sitemap entry, pageview tracking |
| 3 | Smoke test | DONE | 14/14 design checks pass, JS syntax clean, nav verified |

### Decisions Log
- **RPS as primary ranking**: Razzle Prospect Score (athleticism 60% + draft capital 30% + size 10%) gives a data-driven composite that's unique to Razzle. More screenshottable than just listing combine numbers.
- **4 tiers not 8**: Unlike dynasty rankings (8 tiers), prospects only need 4 — the data is sparser and the tiers are more meaningful when fewer.
- **Percentile mini-bars**: Color-coded horizontal bars for each combine metric give an instant visual read on athletic profile. Green = elite, red = concern. Makes each card a mini scouting report.
- **Click → Lab search**: Rather than building a separate prospect profile page, clicking a card searches the Lab in prospect mode. Reuses existing infrastructure and drives users to the Lab.

## Previous Phase: Phase 66 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from phases 61-65 QA audit resolved. fantasy_relevant column added to DB migration. SQL injection pattern replaced with parameterized queries. Connection leak fixed with try/finally and single connection. trackPageview standardized to inline fetch. DVS label and methodology note added to rankings page. Medium fixes: 2px borders on team.html badges, age badge terminology standardized (young/prime/aging), "Full Profile" link in Lab overlay, contextual back navigation in player.js, rate stats hidden on leaders.html "All" view.

### Phase 66 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CRITICAL: fantasy_relevant + SQL injection + connection leak | DONE | Migration added, parameterized queries, try/finally |
| 2 | HIGH: trackPageview analytics | DONE | Inline fetch on team.html and leaders.html |
| 3 | HIGH: Rankings DVS label | DONE | DVS suffix + methodology note in header |
| 4 | MEDIUM fixes | DONE | Borders, age badges, overlay link, back nav, rate stats |
| 5 | Smoke test | DONE | All 10 findings verified fixed, syntax clean |

## Previous Phase: Phase 65 — Team Roster Pages (COMPLETE)

**Exit criterion MET:** /team/{abbr} pages show full fantasy-relevant roster organized by position (QB, RB, WR, TE). Each position group rendered as a comic-strip card with position-colored header tint, display font title, Caveat annotation, and player rows. Player rows show rank, headshot/initials, name, age badge (green ≤25/yellow 26-28/red ≥29), and position-specific stats (PPG highlighted, yards, TDs, games) in mono font. Click player row → player profile. Team selector dropdown with all 32 NFL teams. Season selector dropdown. PNG export via html2canvas with watermark. Teams nav link added to all 10 HTML pages (nav + footer). Team name in player profile and Lab overlay links to /team/{abbr}. Sitemap includes all 32 team pages. OG tags dynamically set per team. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position-colored light tint headers, Space Mono for data, display font for headers, Caveat for annotations.

### Phase 65 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend team roster endpoint | DONE | GET /api/team-roster, grouped by position, ABBREV_TO_TEAM mapping |
| 2 | Team page with position group cards | DONE | Responsive grid, headshots, age badges, position-specific stats |
| 3 | Nav links + team links + sitemap | DONE | All 10 pages updated, player.js + lab.js team links, 32 sitemap entries |
| 4 | Smoke test | DONE | Python + JS syntax clean, design verified, XSS safe, route order correct |

### Decisions Log
- **Team selector default**: Defaults to first team alphabetically (ARI) if no team specified in URL. URL updates via history.replaceState when team changes.
- **Position-specific stats**: QB shows Pass Yds/Pass TD/Rush Yds, RB shows Rush Yds/Rush TD/Rec, WR/TE show Rec Yds/Rec TD/Rec. PPG highlighted in terracotta for all positions. Makes each group immediately useful for its context.
- **Team links from profiles**: Team name in player profile hero and Lab overlay is now a clickable link to /team/{abbr}. Creates natural navigation flow: Lab → player → team → other players on that team.
- **No position filter tabs**: Unlike Rankings/Leaders, team pages don't need position filters since they already organize by position group. Keeps it clean.

## Previous Phase: Phase 64 — Stat Leaders Dashboard (COMPLETE)

**Exit criterion MET:** /leaders.html page shows top 10 players in 10 key fantasy stat categories (PPG, Passing Yards, Passing TDs, Rushing Yards, Rushing TDs, Receiving Yards, Receiving TDs, Receptions, Target Share, Yards Per Carry). Each category rendered as a comic-strip card with category name (display font), Caveat annotation, and top 10 list. Gold/silver/bronze circular rank badges for top 3 with ink borders and offset shadows. Player rows show headshot/initials, name, position badge (color-coded), team, stat value in mono font. Click row → player profile. Position filter tabs (All/QB/RB/WR/TE) with position-specific category filtering. Season selector dropdown. PNG export via html2canvas with watermark. Leaders nav link added to all 9 HTML pages. Sitemap updated. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font for headers, Caveat for annotations.

### Phase 64 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend stat leaders endpoint | DONE | GET /api/stat-leaders, 10 categories, position-specific filtering |
| 2 | Leaders page with category cards | DONE | Responsive grid, gold/silver/bronze badges, hover lift |
| 3 | Filters + season + PNG + nav | DONE | Segmented tabs, season dropdown, html2canvas export, all pages updated |
| 4 | Smoke test | DONE | Python + JS syntax clean, design verified, XSS safe, sitemap updated |

### Decisions Log
- **10 categories**: PPG (all positions), then position-specific passing/rushing/receiving stats + target share + yards per carry. When filtering by position, only relevant categories shown (e.g., QB filter hides receiving stats).
- **Gold/silver/bronze badges**: Top 3 get circular badges with distinct colors (gold #ffc857, silver #c5c5d0, bronze #d97757/terracotta). Makes the top 3 visually pop — instant screenshotability.
- **Caveat annotations**: Each category gets a personality annotation ("slinging it", "red zone royalty", "efficiency kings") — adds the comic-strip character without cluttering data.
- **Separate from Rankings**: Rankings = dynasty trade value tiers. Leaders = raw stat performance. Different user intent, both screenshottable.

## Previous Phase: Phase 63 — Dynasty Rankings Board (COMPLETE)

**Exit criterion MET:** /rankings.html page shows top 200 dynasty-relevant players ranked by dynasty value (0-100), grouped into 8 visual tiers (Tier 1: Elite through Tier 8: Deep Stash). Each player card shows position badge (color-coded), team, age badge (green/yellow/red), dynasty value score, and PPG. Position filter tabs (All/QB/RB/WR/TE) with chunky segmented control. PNG export via html2canvas with watermark. Rankings nav link added to all 8 HTML pages (nav + footer). Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, rotated tier badge stickers, position colors, Space Mono for data, display font for headers, Caveat for annotations.

### Phase 63 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend dynasty-rankings endpoint | DONE | GET /api/dynasty-rankings, compute_trade_value + tier assignment |
| 2 | Rankings page with tiered cards | DONE | Responsive grid, headshots, age badges, hover lift |
| 3 | Position filters + PNG export + nav | DONE | Segmented tabs, html2canvas export, all pages updated |
| 4 | Smoke test | DONE | Python + JS syntax clean, design verified, XSS safe |

### Decisions Log
- **Dedicated page vs Lab view**: Rankings is a different user intent than the Lab screener. The Lab is for exploring/filtering data. The Rankings Board is for seeing the dynasty landscape at a glance — who's in Tier 1, who's a deep stash. Different enough to warrant its own page.
- **8 tiers**: Tier 1 (90+) through Tier 8 (<30) gives granular separation. Labels (Elite, Star, Starter, Solid, Bench, Depth, Flier, Deep Stash) match dynasty community vernacular.
- **Age badges**: Green (≤25), yellow (26-28), red (≥29) — instant visual signal of dynasty window status. Dynasty players care deeply about age.
- **Top-4 tier colors**: Tiers 1-4 get colored badges (terracotta, blue, teal, purple — matching position colors for visual consistency). Lower tiers get neutral badges.

## Previous Phase: Phase 62 — Global Quick Search (COMPLETE)

**Exit criterion MET:** Ctrl+K / Cmd+K opens command palette from any page. Type-ahead search hits lightweight /api/players/quick-search endpoint (indexed search_name LIKE + latest season PPG). Results show player headshot/initials, position badge (color-coded), team, PPG in mono font. Arrow keys navigate, Enter opens player profile, Escape closes. Recently viewed players (max 8) stored in localStorage, shown when input empty. Debounced 300ms search. Works on all 7 pages via app.js injection. Design matches DESIGN.md: sand bg card, 3px ink borders, 4px offset shadow, Caveat annotation, "pulling film..." loading state.

### Phase 62 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend quick-search endpoint | DONE | GET /api/players/quick-search, indexed LIKE + PPG subquery |
| 2 | Command palette UI | DONE | Modal with backdrop blur, position badges, headshots |
| 3 | Keyboard nav + recently viewed | DONE | Ctrl+K, arrows, Enter, Esc, localStorage recents |
| 4 | Smoke test | DONE | Syntax clean, all pages include scripts, design verified |

### Decisions Log
- **Lightweight endpoint**: Created dedicated quick_search_players() instead of reusing heavy fetch_players(). Hits only players table + PPG subquery — no full stat aggregation. Much faster for type-ahead.
- **Recently viewed in palette**: When input is empty, shows last 8 viewed players. Makes the palette immediately useful even without typing — power users can jump between players they're analyzing.
- **All pages**: Palette injected via app.js which all 7 HTML pages include. One component, universal access.

## Previous Phase: Phase 61 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from QA+UX audit of phases 56-60 resolved. XSS patches: 6 unescaped player names + 1 error message in renderPlayerComps/loadPlayerComps wrapped with escapeHtml(). Boom/Bust: histogram legend added (green=boom, red=bust, position=normal), grade sticker labeled "Consistency", consistency score (0-100) added to stat cards. Roster Value: grade badge labeled "Roster Grade" with tooltip, status badge labeled "Window" with tooltip. Backend: negative limit guard on /comps, removed redundant import. Design: stat card borders fixed to 3px/4px per guide. Comp annotation updated to explain cosine similarity.

### Phase 61 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | XSS patches in comps | DONE | 7 escapeHtml() wraps added |
| 2 | Histogram legend + grade label | DONE | Color legend, "Consistency" label |
| 3 | Roster Value explainers | DONE | Tooltips + labels on grade/status |
| 4 | Backend hardening | DONE | Limit validation, dead import removed |
| 5 | Medium fixes | DONE | 3px borders, consistency score, comp annotation |

## Previous Phase: Phase 60 — Boom/Bust Analyzer (COMPLETE)

**Exit criterion MET:** Users can analyze any player's weekly fantasy score distribution via "Boom/Bust" button in player profile. GET /api/players/{id}/boom-bust returns weekly scores, boom rate (% weeks above 1.5× position average), bust rate (% weeks below 0.5× position average), consistency score (inverse coefficient of variation, 0-100), median, floor (10th percentile), ceiling (90th percentile), position-specific thresholds, grade (A+ through F), and position consistency rank. Frontend renders grade badge (rotated sticker, color-coded), 6 stat cards (median, floor, ceiling, boom%, bust%, rank), canvas histogram with boom/bust threshold lines (green/red dashed), and floor-ceiling range bar. "Export Boom/Bust PNG" generates 800×700 canvas image with all visuals and watermark.

### Phase 60 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend boom/bust endpoint | DONE | GET /api/players/{id}/boom-bust, consistency score, grade, percentiles, position rank |
| 2 | Frontend boom/bust UI | DONE | Boom/Bust button, grade sticker, stat cards, loading state |
| 3 | Visual histogram + volatility chart | DONE | Canvas histogram with boom/bust thresholds, range bar |
| 4 | PNG export | DONE | 800×700 canvas PNG with all visuals, watermark |
| 5 | Deploy + smoke test | DONE | All syntax clean, all references verified |

### Decisions Log
- **Boom/bust thresholds**: 1.5× and 0.5× position average PPG. Position-specific because QB PPG is different from RB PPG. A WR "boom" and a QB "boom" have different absolute thresholds.
- **Consistency score**: Inverse coefficient of variation (100 - CV×100). Captures both low-variance (consistent) and high-mean (reliable) production. A player with stdev=3 and mean=15 scores higher than stdev=3 and mean=8.
- **13-tier grade scale**: A+ through F matches the Roster Value Calculator's grading system for consistency across features.
- **In profile overlay**: Like comps, boom/bust analysis lives inside the player profile overlay. Users stay in context.

## Previous Phase: Phase 59 — Player Comp Finder (COMPLETE)

**Exit criterion MET:** Users can find the top-5 most statistically similar NFL players via cosine similarity on position-specific per-game stat vectors. "Find Comps" button in player profile overlay triggers GET /api/players/{id}/comps. Results render as position-colored comp cards showing similarity % (color-coded: 95%+ green, 90%+ orange), headshot/initials, team, games, PPG, and top 3 matching stats. Mini radar chart overlays target vs top comp on key stats. Full stat comparison table shows target + top 3 comps. "Export Comps PNG" generates branded canvas image with comp cards, stat table, and watermark.

### Phase 59 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend similarity endpoint | DONE | GET /api/players/{id}/comps, cosine similarity, position-specific vectors |
| 2 | Frontend comp finder UI | DONE | Find Comps button, comp cards, similarity %, matching stats |
| 3 | Visual comp report | DONE | Radar overlay, stat comparison table, Caveat annotation |
| 4 | PNG export | DONE | Canvas PNG with comp cards, stat table, watermark |
| 5 | Deploy + smoke test | DONE | All syntax clean, all references verified |

### Decisions Log
- **Position-specific stat vectors**: QB uses passing stats (ypg, td/g, comp%, y/a) + rushing + PPG. RB uses rushing + receiving + PPG + td rate. WR/TE use receiving stats + catch rate + PPG + td rate. 8 stats per position ensures meaningful comparisons within position groups.
- **Cosine similarity over Euclidean**: Cosine similarity captures production profile shape regardless of volume magnitude (a young player with fewer games but similar per-game rates will match veteran profiles).
- **Min 4 games filter**: Prevents tiny-sample comps from noise. Balances catching emerging players vs statistical reliability.
- **Comp in profile overlay**: Adding comps inside the existing profile overlay (not a new page) keeps the flow tight — user views a player, clicks "Find Comps", sees results without leaving context.

## Previous Phase: Phase 58 — Roster Value Calculator + Team Card (COMPLETE)

**Exit criterion MET:** Users can build a dynasty roster via "My Roster" button in Lab toolbar. Search to add players (localStorage persistence). "Calculate Value" sends player IDs to POST /api/roster-value which returns trade values, positional breakdown, average age, letter grade (A+ through F), and competing status (competing/retooling/rebuilding). Visual report shows: grade badge (comic-strip rotated sticker), positional pie chart (QB/RB/WR/TE), age vs value scatter plot, and ranked player values table. "Export Team Card" generates branded PNG with all visuals, player table, and razzle.lol watermark.

### Phase 58 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend roster-value endpoint | DONE | POST /api/roster-value, grade A+ to F, competing status |
| 2 | Frontend My Roster panel | DONE | Search + add + remove, localStorage, grouped by position |
| 3 | Visual roster report | DONE | Pie chart, age scatter, grade badge, player values table |
| 4 | PNG export team card | DONE | Canvas PNG, watermark, pie + scatter + player table |
| 5 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Grading scale**: Based on total roster trade value with 12 thresholds (A+ = 600+, F = <70). Benchmarked against typical 12-team dynasty league where a good roster might have 10-15 players at 30-50 value each.
- **Competing status heuristic**: Uses combination of total value and average age. Young + valuable = competing. Old or low value = rebuilding. Everything else = retooling.
- **Reused trade value model**: Leverages existing fetch_trade_values() for individual player values, keeping the system consistent with Trade Analyzer.

## Previous Phase: Phase 57 — Draft Pick Trade Calculator (COMPLETE)

**Exit criterion MET:** Trade Analyzer now supports dynasty draft picks (2025-2027, rounds 1-4, picks 1-12) alongside players. Pick values follow exponential decay curve (1.01=88.0, 1.12=40.7, 2.01=38.0, 4.12=3.3) on same 0-100 scale as player values. Users can add picks via Year/Round/Pick dropdowns + "Add Pick" button on both trade sides. Visual pick value chart (canvas) shows full 48-pick decay curve with round-colored dots and selected-pick highlighting. Pick cards render with round-colored badges (Rd1=terracotta, Rd2=blue, Rd3=teal, Rd4=purple). PNG export handles picks. Comic-strip design throughout.

### Phase 57 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Pick value model + API | DONE | Exponential decay, GET /api/trade/pick-values, 48 picks |
| 2 | Frontend pick selector | DONE | Dropdowns + "Add Pick" on both sides, pick cards with round colors |
| 3 | Visual pick value chart | DONE | Canvas curve, 48 dots, round colors, selected highlighting |
| 4 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Exponential decay model**: V = 88 * e^(-0.07 * (pick-1)). Calibrated so 1.01 ≈ top-5 dynasty asset (88), late 4th ≈ dart throw (3.3). Same 0-100 scale as player trade values for direct comparison.
- **Round colors match position colors**: Rd1=terracotta (WR), Rd2=blue (QB), Rd3=teal (RB), Rd4=purple (TE). Reuses existing design palette for consistency.
- **Multi-year support**: Year dropdown allows 2025-2027. Pick values are identical across years (no future discount) — simplest version that works for dynasty rookie drafts.

## Previous Phase: Phase 56 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from Phases 51-55 audit resolved. XSS patched in league-intel.html (15 escapeHtml/escapeAttr calls). FILTER_COLUMN_MAP SQL column names fixed (pass_attempts→attempts, total_tds→touchdowns). Heat coloring: tooltip explains percentile scale, button hidden in non-NFL modes. Sleeper players endpoint cached. Design guide border violations fixed (1px→2px). formatTimeAgo "just now" for recent entries.

### Phase 56 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | XSS patches | DONE | All Sleeper API data escaped in league-intel.html |
| 2 | FILTER_COLUMN_MAP fix | DONE | pass_attempts→attempts, total_tds→touchdowns |
| 3 | Heat coloring UX | DONE | Tooltip, hidden in non-NFL modes |
| 4 | MEDIUM fixes | DONE | Sleeper cache, borders, formatTimeAgo |
| 5 | Deploy + smoke test | DONE | All syntax clean |

## Previous Phase: Phase 55 — Player Headshots in Lab Table (COMPLETE)

**Exit criterion MET:** Lab table displays 28px circular player headshots next to player names. nflverse headshot_url stored in players table and returned in all screener/profile API responses. Position-colored initials fallback for missing headshots (college/prospects). Headshots also in profile overlay (56px) and standalone player page (64px). Responsive (22px at 768px, hidden at 480px). Comic-strip aesthetic with chunky ink borders.

### Phase 55 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend headshot_url storage | DONE | Column added to players table, nflverse adapter stores during sync, migration for existing DBs |
| 2 | Backend API response | DONE | headshot_url in all 3 screener queries + all 3 profile queries |
| 3 | Frontend headshot rendering | DONE | playerHeadshot() helper, onerror fallback initials, all universes |
| 4 | Deploy + smoke test | DONE | All syntax clean, lazy loading, responsive |

### Decisions Log
- **Headshot in all universes**: NFL players get real headshots from nflverse CDN. College/prospects get position-colored initials fallback (no headshot URLs in college data). Consistent visual treatment across all modes.
- **onerror fallback**: If headshot CDN fails, gracefully falls back to hidden img + visible initials span. No broken image icons.
- **Hidden at 480px**: On very small screens, headshots take too much horizontal space in the already-cramped player name cell. Hidden entirely below 480px.

## Previous Phase: Phase 54 — Lab Percentile Heat Coloring (COMPLETE)

**Exit criterion MET:** Lab table cells color-coded by positional percentile rank via "Heat" toggle button. Per-position percentile computation (frontend-only). Elite (90th+) green-tinted, poor (<10th) red-tinted, average neutral. Inverse stats (turnovers, fumbles, INTs, etc.) correctly inverted. Toggle persists in URL (heat=1) and localStorage. Keyboard shortcut H. Warm-shifted rgba colors match Anthropic sand palette.

### Phase 54 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Percentile calculation | DONE | Frontend-only, per-position, cached |
| 2 | Heat coloring UI | DONE | Toggle button, color scale, all universes |
| 3 | Polish & edge cases | DONE | Inverse stats, URL/localStorage, shortcut H |
| 4 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Frontend-only percentiles**: Chose client-side computation over backend endpoint. Data already loaded in state.items. No API changes, no additional DB queries. Percentiles are relative to current view/filters which is more useful.
- **Per-position percentiles**: A WR with 800 receiving yards is elite among WRs but that shouldn't be compared to QBs. Each position group gets its own distribution.
- **Warm-shifted rgba**: Used rgba() with low opacity to tint cells rather than solid backgrounds, keeping the Anthropic sand aesthetic. Green = teal-shifted (#2ec4b6), Red = warm (#e63946).

## Previous Phase: Phase 53 — Reddit Launch Prep (COMPLETE)

**Exit criterion MET:** Featured card "Open in Lab" links enhanced with rich preset URLs (dynasty_value sort, receiving columns, min_gp filters). All preset URL system verified working. Reddit title generator comprehensive.

### Phase 53 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Enhanced featured card links | DONE | Rich Lab URLs |
| 2 | Preset URL verification | DONE | All params work |
| 3 | Reddit title generator | DONE | Already good |
| 4 | Deploy + smoke test | DONE | All syntax clean |

## Previous Phase: Phase 52 — War Room Agent Memory (COMPLETE)

**Exit criterion MET:** War Room persists briefing history (max 20 entries) in localStorage. Memory button toggles history panel. Keyword-scored relevance matching injects top 3 past briefings as "WHAT THE WAR ROOM REMEMBERS" into agent prompts. Clear memory option available.

### Phase 52 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Briefing history storage | DONE | localStorage, max 20, key findings extracted |
| 2 | History panel UI | DONE | Toggle, timestamps, clear memory |
| 3 | Memory injection | DONE | Keyword relevance scoring, top 3 |
| 4 | Deploy + smoke test | DONE | All syntax clean |

## Previous Phase: Phase 51 — League Intel Manager Profiles (COMPLETE)

**Exit criterion MET:** League Intel page now has "Scout Rival Managers" button that fetches Sleeper transaction history (weeks 1-18) and generates behavioral profiles for rival managers. Each profile shows: manager name, record, behavioral summary (e.g., "active trader, stockpiles WRs, FAAB whale"), trade count, waiver count, FAAB spent, total moves. Profiles saved to localStorage for War Room context bridge. Comic-strip card design, mobile responsive.

### Phase 51 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fetch Sleeper transactions | DONE | Parallel fetch weeks 1-18 |
| 2 | Behavioral analysis engine | DONE | Traits: trade tendency, position bias, FAAB, activity |
| 3 | Manager profile cards UI | DONE | 2-col grid, color stripes, context bridge |
| 4 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Client-side analysis**: Transaction data fetched from Sleeper API directly in browser. No backend needed.
- **18-week parallel fetch**: All weeks in parallel for ~500ms total.

## Previous Phase: Phase 50 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All CRITICAL and HIGH findings from Phases 46-49 audit fixed. XSS in OG tags patched (html.escape on all 3 handlers). Stored XSS in formula review text patched (escapeHtml). User enumeration fixed (generic login error). Rate limiter memory bounded (10k IP cap). Shuffle button visibility improved (yellow on dark bg). Accessibility improved (aria-live on demo cards). Position values escaped in featured cards.

### Phase 50 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CRITICAL: OG tag XSS | DONE | _html.escape on lab, player, compare handlers |
| 2 | CRITICAL: Formula review XSS | DONE | escapeHtml(existingUserReview.text) |
| 3 | HIGH: Login user enumeration | DONE | Generic "Invalid email or password" for both cases |
| 4 | HIGH: Rate limiter memory | DONE | _RATE_MAX_IPS=10000, stale pruning |
| 5 | HIGH: Shuffle button + a11y | DONE | Yellow text/border, aria-live="polite" |
| 6 | MEDIUM: Position escaping | DONE | escapeHtml(p.position) in featured cards |
| 7 | Deploy + smoke test | DONE | All syntax clean |

## Previous Phase: Phase 49 — Performance Audit + Optimization (COMPLETE)

**Exit criterion MET:** Added composite SQLite index idx_pws_season_player(season, player_id) for the most common screener query pattern. Added GZipMiddleware for all JSON responses (min 500 bytes). Added Cache-Control headers (5 min) on /api/featured and /api/filter-options. Added in-memory Python cache (5-min TTL) for filter_options and featured queries. Audited all enrichment functions — all batch by player_id (no N+1 queries). Frontend table rendering already optimized (single innerHTML assignment, debounced search, reusable canvas).

### Phase 49 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend index + query audit | DONE | Composite index on season,player_id. No N+1 queries. |
| 2 | Frontend render audit | DONE | Already optimized — innerHTML batch, debounced search, reusable canvas |
| 3 | API caching + gzip | DONE | GZipMiddleware, Cache-Control 300s, in-memory Python cache |
| 4 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Season-first composite index**: The main screener query filters by season then joins on player_id. Existing index was (player_id, season, week) — great for per-player lookups but forces full index scan when filtering by season. New (season, player_id) index covers the common query path.
- **In-memory cache over Redis**: Simple dict-based cache with TTL. No external dependency. Resets on restart, but data only changes on adapter sync. Sufficient for current scale.
- **GZip at 500 bytes**: Screener JSON responses are typically 50-200KB. GZip reduces this 5-10x. Minimal CPU overhead.

## Previous Phase: Phase 48 — Agent Bio Cards + War Room Demo (COMPLETE)

**Exit criterion MET:** All features already existed from prior work. Home page has "Meet the Team" section with 6 agent bio cards (pixel avatar, name, role, specialty) in comic-strip card style with color stripes and stagger rotation. War Room demo section shows 3 randomized anonymized briefing snippets with urgency badges and redacted league data, plus shuffle button. Agent bio cards also on agents.html hero section via warroom.js. Mobile responsive at 768px and 480px. All syntax verified clean.

### Phase 48 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Agent bio data | DONE | AGENT_BIOS in index.html, matching data in warroom.js |
| 2 | Bio cards on home + agents page | DONE | renderAgentBios() + warroomBioGrid |
| 3 | War Room demo on home page | DONE | 20+ demoBriefings, renderDemoCards(), shuffle |
| 4 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **Already built**: Phase 48 features were implemented in earlier phases. Verified present and working rather than rebuilding.

## Previous Phase: Phase 47 — Home Page Live Data Widgets (COMPLETE)

**Exit criterion MET:** Home page shows 3 live data widgets — Dynasty Risers (PPG/age ratio), Rookie Big Board (prospect scores), Breakout Candidates (high target share + low PPG). Each card shows 5 players with position badges, key stats, and "Open in Lab" links with pre-applied filters. Styled in comic-strip design (3px borders, 4px shadows, sand bg). Mobile responsive (cards stack at 768px). Fade-in animation. Loading state: "pulling film...". Graceful error handling.

### Phase 47 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/featured endpoint | DONE | fetch_featured() in live_data.py — 3 SQL queries for dynasty_risers, rookie_board, breakout_candidates |
| 2 | Frontend featured cards | DONE | 3 cards below hero, position badges, key stats, "Open in Lab" links |
| 3 | Mobile responsive + animation | DONE | Stack at 768px, fade-in, loading/error states |
| 4 | Deploy + smoke test | DONE | All syntax clean, JS + Python verified |

### Decisions Log
- **Featured data source**: Used existing terminal.db tables — player_season_stats for dynasty risers and breakout candidates, big_board for rookie prospects. No new data sources needed.
- **Lab link format**: Each card links to Lab with pre-applied universe, sort, and filter params via URL query string. Users land in the Lab with context already set.
- **Graceful degradation**: Featured section hidden entirely if API fetch fails. No broken UI for first-time visitors.

## Previous Phase: Phase 46 — QA + UX Audit Fixes (COMPLETE)

**Exit criterion MET:** All critical and high findings from Phases 41-45 QA+UX audit fixed. Formula store XSS patched (escapeHtml on name/creator/description). War Room API key notice shown upfront with disabled Run button until key set. Lab first-visit toast guides new users to presets. Auth rate limiting (10/min/IP) on login/register. Generic error messages in auth.py. Home page "Coming Soon" updated. Prospect/college zero values show "—" instead of 0. Draft year range validated.

### Phase 46 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula store XSS fix | DONE | escapeHtml on name, creator, description |
| 2 | War Room API key messaging | DONE | Notice div, disabled Run button, updateApiKeyNotice() |
| 3 | Lab first-visit preset toast | DONE | razzle_lab_visited flag, PPR preset hint, 6s auto-dismiss |
| 4 | Rate limiting + error messages + copy | DONE | 10/min/IP, generic errors, "The War Room" |
| 5 | MEDIUM fixes — zeros, draft year | DONE | Prospect/college dash for 0, draft_year range validation |
| 6 | Deploy + smoke test | DONE | All syntax clean |

### Decisions Log
- **In-memory rate limiter**: Simple defaultdict-based rate limiter. No external dependency. Resets on restart, but sufficient for current scale. Replace with Redis-backed limiter when needed.
- **First-visit toast not modal**: Chose a dismissible toast over a modal overlay. Modals block the user; toasts inform without friction. Matches the "trust the user" design principle.
- **Prospect zero suppression**: All 0/null/undefined values in prospect and college mode show "—". This is aggressive but correct — prospects without NFL stats shouldn't show 0.

## Previous Phase: Phase 45 — War Room Pro Gating — Free vs Paid Context (COMPLETE)

**Exit criterion MET:** War Room league context injection gated to Pro subscribers only. `isLeagueContextMode()` now requires `isProUser()` (user.plan === "pro") AND `hasLeagueData()`. Free users with Sleeper connected see "League Context — Pro Only" locked badge, forced into generic mode. Pro users get full league context injected into agent prompts. Post-scenario teaser card for free users: "your league data is connected but locked" with Upgrade CTA. Briefing cards show "Pro" pill when league context active, or generic mode hint for free users. CSS for locked badges, pro pill, generic hint, and teaser card all follow design system.

### Phase 45 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Gate league context to Pro subscribers | DONE | isProUser(), hasLeagueData(), isLeagueContextMode() gated, buildUserMessage() gated |
| 2 | Paywall UX — locked badges, CTA, teaser | DONE | Locked badge, Pro Only label, post-run teaser card with checkout CTA |
| 3 | Pro indicator on response cards | DONE | Pro pill badge, generic hint text on briefing cards |
| 4 | Deploy + smoke test | DONE | All syntax clean, gating logic verified |

### Decisions Log
- **Client-side gating**: League context gating is enforced in the browser JS. Since LLM calls are browser-side (user's own API key), server-side enforcement isn't needed yet. Future: when Razzle hosts LLM calls for Pro users, server-side gating will be added.
- **Three-state badge**: Mode badge now has three states: "League Context — Pro" (active/green), "League Context — Pro Only" (locked/orange), "Generic Mode" (inactive/gray). Clear visual hierarchy for the conversion funnel.
- **Post-scenario teaser**: Only shown when user has league data but isn't Pro. Doesn't show for users without Sleeper connected (they see the existing upsell zone instead). Avoids double-prompting.

## Previous Phase: Phase 44 — Brand Voice — Watermark, Copy, Personality Pass (COMPLETE)

**Exit criterion MET:** All watermarks updated to "razzle.lol — let's razzle dazzle em baby". Zero instances of "built different" remain. All UI copy matches brand identity — film room energy, peer tone, no corporate language. Loading states use "pulling film...", "checking the tape...", "running the numbers...". Error states use "fumble" language. 404 page: "This page got cut from the roster." 28 column tooltips rewritten in warm, peer-like brand voice. Home page hero subtitle updated. War Room upsell copy on-brand. Export PNGs carry new watermark.

### Phase 44 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Update all watermarks to new tagline | DONE | 12 canvas in lab.js, 3 in charts.js, 5 HTML footers, 2 SVG OG images, meta desc, DESIGN.md |
| 2 | Brand voice pass on all UI copy | DONE | 404, error messages, War Room upsell, home hero, formula store errors |
| 3 | Tooltip voice pass | DONE | 28 tooltips rewritten — WOPR, RACR, DAKOTA, DVS, aDOT, YPRR, CPOE etc. |
| 4 | Deploy + smoke test | DONE | All syntax clean, zero "built different", brand voice consistent |

### Decisions Log
- **Watermark tagline**: "razzle.lol — let's razzle dazzle em baby" per DESIGN.md brand voice section.
- **Tooltip tone**: Warm, slightly opinionated, peer-like. One sentence max. No clinical definitions.
- **Error language**: "fumble" metaphor for failures, consistent with football film room voice.

## Previous Phase: Phase 43 — Stripe Integration — Subscriptions and Payment (COMPLETE)

**Exit criterion MET:** Stripe integration complete. Backend: POST /api/billing/create-checkout (yearly/monthly), POST /api/billing/webhook (signature verified, handles checkout completed/subscription deleted/payment failed), GET /api/billing/status (plan + portal URL). Subscriptions table in users.db. Frontend: plan badge in nav (Free/Pro), Manage Subscription link for pro users, War Room upsell calls startCheckout(), pricing section on home page ($240/year + $20/month). All keys from env vars. stripe>=7.0.0 added to requirements.txt.

### Phase 43 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend Stripe endpoints + webhook | DONE | billing.py, 3 endpoints, webhook handler |
| 2 | Frontend upgrade flow + billing UI | DONE | Plan badge, Manage link, pricing section, checkout integration |
| 3 | Deploy + smoke test | DONE | All syntax clean, billing flow verified |

### Decisions Log
- **Env var config for all Stripe keys**: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_YEARLY, STRIPE_PRICE_MONTHLY all from environment. Graceful fallback (503) when not set.
- **Subscriptions table in users.db**: Keeps billing data with user data, separate from terminal.db stats.
- **Plan badge in nav**: Simple visual indicator — gray "Free" or terracotta "Pro" badge next to username.

## Previous Phase: Phase 42 — Auth System — Registration, Login, JWT, Protected Endpoints (COMPLETE)

**Exit criterion MET:** Users can register with email/password, log in, receive JWT token, and access protected endpoints. bcrypt hashing (12 rounds), JWT 7-day expiry, JWT_SECRET from env var. Frontend auth modal on all pages with Sign In/Register tabs, token in localStorage, auto-included Authorization headers. Sleeper username linkable to account with post-login prompt. Formula publish requires auth. War Room upsell is auth-aware. User formulas sync to server database. users.db separate from terminal.db.

### Phase 42 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend auth endpoints + user table | DONE | auth.py + users.db, bcrypt, JWT, 4 endpoints |
| 2 | Frontend login/register modal | DONE | Injected via app.js on all pages, Razzle design system |
| 3 | Link Sleeper username | DONE | Post-login prompt, nav display, League Intel auto-connect |
| 4 | Protect endpoints + plan gating | DONE | require_plan(), formula publish auth, War Room auth-aware CTA |
| 5 | Migrate formulas to database | DONE | CRUD endpoints, server sync, auto-import on login |
| 6 | Persistent users.db | DONE | Separate from terminal.db, created on startup |
| 7 | Deploy + smoke test | DONE | All syntax clean, full auth flow verified |

### Decisions Log
- **Auth UI via JS injection**: Added auth functions to app.js, which injects Sign In button and modal into any page with a .topnav .nav-links. No per-page HTML changes needed for the auth UI itself.
- **Error dict pattern**: auth.py returns error dicts instead of raising HTTPException, server.py checks for "error" key and converts to JSONResponse. Simpler testing.
- **Sleeper prompt after login**: Shows Sleeper connect form in the auth modal after login/register if no sleeper_username linked. Skippable.
- **Formula sync alongside localStorage**: Rather than replacing localStorage, server sync runs in parallel. Non-logged-in users keep using localStorage. Logged-in users get both (localStorage for instant load, server for cross-device).

## Previous Phase: Phase 41 — Stats Expansion — Play-by-Play Extractions (COMPLETE)

**Exit criterion MET:** Play-by-play data extracted from nflverse pbp CSVs via new sync_pbp_data() function. Single-pass extraction populates player_season_pbp table. Stats available: pass/rush success rate, scramble stats, garbage time %, game script, goal-line carries/targets/TDs, two-point conversions, return yards/TDs, intended air yards per target, drop rate, bye week, games missed. 18 new columns wired into Lab screener with tooltips and updated presets. RYOE columns in schema but NULL (nflverse pbp lacks expected rushing yards). Play-action stats NULL (nflverse 2024 lacks is_play_action column).

### Phase 41 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Success rate + RYOE + game script | DONE | Pass/rush success rate via EPA>0, game script via avg score_differential |
| 2 | Play-action + scramble + garbage time | DONE | Scramble via qb_scramble on run plays, garbage time computed |
| 3 | Goal-line + 2PT + returns | DONE | GL inside 5-yard line, 2PT via two_point_conv_result, returns from kickoff/punt |
| 4 | Intended air yards + drop rate | DONE | IAY on all targets, drops estimated via incomplete short-medium passes |
| 5 | Bye week + injury data | DONE | Bye from schedule gaps, injury from nflverse injury designations |
| 6 | Wire as Lab screener columns | DONE | 18 new COLUMNS with tooltips, presets updated |
| 7 | Deploy + smoke test | DONE | All syntax clean, values verified |

### Decisions Log
- **Single-pass pbp extraction**: All Tasks 1-4 share one pbp CSV download, extracting all stats in parallel. Much faster than 4 separate passes.
- **Scrambles are run plays**: nflverse 2024 classifies scrambles as play_type=run with qb_scramble=1. Code handles both locations.
- **Play-action unavailable**: nflverse 2024 pbp lacks is_play_action column. Desc-field fallback also returns nothing. Columns in schema but NULL.
- **RYOE unavailable**: nflverse pbp has xyac for receiving but no expected rushing yards. Columns in schema but NULL.
- **Drop rate is estimated**: Uses incomplete short-medium passes (air_yards<15, non-INT) as proxy since nflverse doesn't have a clean drop flag.

## Previous Phase: Phase 40 — Stats Expansion — Computed Columns (COMPLETE)

**Exit criterion MET:** 11 new computed stat columns in the Lab screener, all derived from existing database fields with no adapter changes. Passer rating (NFL formula), AY/A, TD rate, fumble rate, dominator rating (WR/TE), rush share (RB/QB), YPRR* approximation, WOPR/G, PPFD, PPFD/G, plus custom scoring builder with up to 3 named configs. Red zone share skipped (no play-by-play data yet). PPFD ready but first_downs data not yet in DB.

### Phase 40 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Passer rating + AY/A + TD rate + fumble rate | DONE | NFL formula with clamped components, all in _enrich_with_derived_stats() |
| 2 | Dominator rating + rush share | DONE | Team-share query via _enrich_with_team_shares(), position-filtered |
| 3 | YPRR* + WOPR/G | DONE | YPRR via snap-based route estimation, WOPR/G in _enrich_with_epa_per_play() |
| 4 | PPFD + superflex tooltip | DONE | PPR + 1pt per first down, PPR tooltip updated |
| 5 | Custom scoring builder | DONE | Modal with 12 weight inputs, localStorage, up to 3 configs |
| 6 | Deploy + smoke test | DONE | All syntax clean, values verified |

### Decisions Log
- **Red zone share skipped**: No rz_ columns in player_week_stats. Would require play-by-play extraction (Ticket 3).
- **WOPR/G placement**: Must run after _enrich_with_rate_metrics() populates wopr field, so placed in _enrich_with_epa_per_play().
- **YPRR estimation**: Uses offense_snaps * 0.85 for route participation estimate. Falls back to games * 45 * 0.85 if no snap data.
- **Custom scoring approach**: Client-side computation from raw stat values, not server-side. Allows instant recalculation without API calls.

## Previous Phase: Phase 39 — Shareable Player Comparison Pages (COMPLETE)

**Exit criterion MET:** Standalone /compare/{id1}/{id2} URL renders side-by-side player cards with stat differentials, overlaid radar chart, career arc comparison, and dynamic OG meta tags for rich Reddit/Discord previews. PNG export (1200x630) with watermark. Compare button on player profile pages with search overlay. Mobile responsive at 768px and 480px. All syntax clean.

### Phase 39 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Build compare.html + compare.js | DONE | Side-by-side heroes, stat diff table, radar overlay, career arc, PNG export |
| 2 | Server route + OG tags + profile compare button | DONE | /compare/{id1}/{id2} with dynamic OG, player profile "Compare" button |
| 3 | Syntax check + smoke test | DONE | All 8 JS files + Python modules clean |

### Decisions Log
- **Compare via profiles, not Lab rows**: Chose to add Compare button to player profile pages rather than cluttering the dense Lab screener table. Users click a player name → see profile → hit Compare → search for second player. Clean flow, doesn't bloat the screener UI.
- **Same-position color differentiation**: When comparing two players of the same position, the second player gets a darker shade of the position color to maintain visual distinction in radar overlay and stat table.

## Previous Phase: Phase 38 — QA Audit Round 2 — Critical + High Bugfixes (COMPLETE)

**Exit criterion MET:** All critical and high-priority bugs from QA audit fixed. Missing Response import added. fetchData() reference fixed. CORS restricted to razzle.lol. SQL filter keys use explicit mapping. DVS popover age curves corrected. Rams team abbreviation fixed. War Room game loop cleanup added. Waitlist validation added. QB profile INT label fixed. College preset detection fixed. Prospect filter labels fixed. All medium issues addressed. Deployed to Render.

### Phase 38 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix critical server crashes + security | DONE | Response import, fetchData fix, CORS restrict, FILTER_COLUMN_MAP |
| 2 | Fix DVS popover + Rams abbreviation + QB INT label | DONE | Age curves corrected, LA→LAR, INT→TO |
| 3 | Fix War Room memory leaks + waitlist validation | DONE | rAF cleanup, particle cap 200, interval pause, email validation, rate limit |
| 4 | Fix college/prospect mode bugs | DONE | Preset detection, filter labels, image export universe-aware |
| 5 | Fix medium issues — fonts, performance, error handling | DONE | Font stack, Space Mono cells, shared escapeHtml, watchlist cache, JSON catch, prospect SQL |
| 6 | Fix low issues — og:image, dead code, collision map | DONE | OG PNG images, dead ternary, carries key, QB total_tds, plant blockTiles |
| 7 | Deploy + smoke test all QA fixes | DONE | All syntax checks pass, all fixes verified |

### Decisions Log

## Previous Phase: Phase 37 — Trade Analyzer (COMPLETE)

**Exit criterion MET:** Trade Analyzer accessible from Lab toolbar via "Trade" button. Two-sided player search, dynamic trade value model (PPR PPG 50% + age curve 30% + scarcity 20%). Value bars with position-colored segments, WIN/LOSS/FAIR verdict badge, Razzle commentary quips. Trade card PNG export (1200x630) with watermark. Mobile responsive. All tasks PASS.

### Phase 37 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend trade value model + API endpoint | DONE | Production 50% + age curve 30% + scarcity 20%, 0-100 scale |
| 2 | Trade Analyzer UI — two-sided card with player search | DONE | Trade button in toolbar, I Give/I Get sides, API search, position cards, verdict |
| 3 | Value comparison display + verdict + commentary | DONE | Value bars, verdict badge (WIN/LOSS/FAIR), Razzle quips, live updates |
| 4 | Trade card PNG export with watermark | DONE | 1200x630 canvas, both sides, verdict, watermark |
| 5 | Deploy + smoke test | DONE | All syntax checks pass, all features verified |

### Decisions Log
- **Trade value model**: Chose composite of PPR PPG (production), age depreciation curve (exponential decay past positional peak), and positional scarcity (RB premium). Simple, transparent, no external data dependency. Dynasty-oriented: penalizes aging RBs heavily, rewards young producers.

## Previous Phase: Phase 36 — Player Watchlist + Tier Board (COMPLETE)

**Exit criterion MET:** Star button (★/☆) on every player row in Lab screener toggles watchlist (localStorage). Watchlist button in toolbar shows count badge. Watchlist panel groups players by position with tier dropdown (Untiered/Tier 1-5) and remove button. Tier Board view renders visual tier list with position-colored player cards, rotated tier sticker badges, chunky borders. PNG export (800px wide, sand bg, watermark). Keyboard shortcut W. All 3 universes supported. Pushed to master.

### Phase 36 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Watchlist data model + star button | DONE | localStorage razzle_watchlist, ★/☆ toggle, terracotta filled star |
| 2 | Watchlist panel overlay | DONE | Position-grouped, tier dropdown, remove button, W shortcut |
| 3 | Tier board view | DONE | 6 tier sections, rotated sticker badges, position-colored cards |
| 4 | Tier board PNG export | DONE | 800px canvas, 4-column cards, watermark, auto-height |
| 5 | Deploy + smoke test | DONE | All syntax clean, pushed to master |

## Previous Phase: Phase 35 — SEO + Analytics + Revenue Foundation (COMPLETE)

**Exit criterion MET:** Dynamic sitemap.xml with all pages + top 200 player profiles. robots.txt. JSON-LD Schema.org Person data on player pages. Lightweight pageview analytics (SQLite) with inline tracking on all 6 pages. AdSense-ready ad slot divs. Consistent footer with nav links on all pages. Pushed to master.

### Phase 35 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | sitemap.xml + robots.txt | DONE | Dynamic XML with pages + player profiles |
| 2 | Structured data (JSON-LD) | DONE | Schema.org Person on player pages |
| 3 | Analytics tracking | DONE | SQLite pageviews + inline scripts on all pages |
| 4 | AdSense ad slots | DONE | Divs on index + player pages |
| 5 | Consistent footer | DONE | Nav links + tagline on all pages |
| 6 | Deploy + smoke test | DONE | All syntax clean, pushed |

## Previous Phase: Phase 34 — Lab Power-User Polish + Keyboard Shortcuts (COMPLETE)

**Exit criterion MET:** Keyboard shortcuts: / focuses search, Esc closes overlays, 1-5 switches position, S/C/F/M/X open panels, ? opens styled reference overlay. Hint strip in toolbar. Table alternating row stripes. Confirmed existing: checkboxes, compare, saved views, filter breadcrumbs all working. Pushed to master.

### Phase 34 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Keyboard shortcuts | DONE | /, Esc, 1-5, S/C/F/M/X, ? reference overlay, hint strip |
| 2 | Table row stripes | DONE | nth-child(even) subtle stripes + hover |
| 3 | Quick-compare | DONE | Already existed: checkboxes + compare button |
| 4 | Filter breadcrumbs | DONE | Already existed: activeFilters with dismiss |
| 5 | Saved views | DONE | Already existed: overlay with names |
| 6 | Deploy + smoke test | DONE | All syntax clean, pushed to master |

## Previous Phase: Phase 33 — Shareable Player Profile Pages (COMPLETE)

**Exit criterion MET:** Dedicated /player/{id} URL with standalone player.html + player.js. Dynamic OG meta tags (player name, position, team, PPR/G) for rich Reddit/Discord previews. Hero card with position badge, headline stat cards, position-specific radar chart, career arc line chart, season log table, combine/draft data. Export PNG (1200x630) with watermark. Copy link button. Lab player names href for middle-click deep linking. Mobile responsive at 768px and 480px. All syntax clean. Pushed to master.

### Phase 33 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend player profile endpoint | DONE | Already existed at /api/players/{id}/profile |
| 2 | Player profile HTML page + routing | DONE | player.html + server route with dynamic OG tags |
| 3 | Player profile stats display | DONE | Hero card, stat cards, season log, combine grid |
| 4 | Embedded radar + trend charts | DONE | Position-specific radar + career arc canvas charts |
| 5 | Player profile PNG export | DONE | 1200x630 canvas with watermark + copy link |
| 6 | Link player names in Lab | DONE | href for middle-click, onclick for overlay |
| 7 | Mobile responsive + deploy | DONE | 768px + 480px breakpoints, pushed to master |

## Previous Phase: Phase 32 — Formula Store (Community Marketplace) (COMPLETE)

**Exit criterion MET:** Formula Store fully operational. Backend: formula_store + formula_ratings SQLite tables, 4 API endpoints (publish, browse, rate, detail). Frontend: formula-store.js fully API-backed with async fetch, position filter, sort, debounced search, star ratings, review input, import with toast, publish with duplicate prevention. 10 seed formulas auto-populate on first boot (PPR Workhorse, Alpha WR, Dual Threat QB, Bellcow Index, TD Machine, Target Hog, TE Premium, Dynasty Value, YAC Monster, Pocket Passer). All JS/Python syntax clean. Pushed to master.

### Phase 32 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend formula store endpoints + database schema | DONE | formula_store + formula_ratings tables, 4 endpoints, 5 data functions |
| 2 | Formula Store browse UI | DONE | API-backed browse with filter/sort/search, position badges, star ratings |
| 3 | Publish flow from formula builder | DONE | async POST to API, duplicate prevention, success toast |
| 4 | Rating and review system | DONE | POST to API, optimistic update, localStorage tracking, review input |
| 5 | Formula detail view + import | DONE | GET detail for weights, localStorage + COLUMNS registration, toast |
| 6 | Seed store with starter formulas | DONE | 10 seed formulas in _seed_formula_store(), auto-inserted on empty table |
| 7 | Deploy + smoke test | DONE | All syntax clean, pushed to master |

## Previous Phase: Phase 31 — Performance + UX Polish + Reddit Launch Prep (COMPLETE)

**Exit criterion MET:** Performance audit: Lab already optimized (100 row limit, 300ms search debounce, single API calls). Console audit: no debug console.logs, only console.error for error handling. Viewport: maximum-scale=1.0 on all 5 pages prevents iOS zoom on input focus. Loading states: "pulling film..." / "fumbled the data fetch..." pattern across all 15+ async flows. Favicon: tiger emoji SVG on all pages. Page titles: descriptive and branded. SEO: meta descriptions + canonical URLs on all 5 pages. War Room mobile: 480px breakpoint with single-column bio grid, full-width config panel. Deployed to Render.

### Phase 31 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Optimize Lab screener load performance | DONE | Already optimized: 100 row limit, 300ms debounce, no duplicate API calls |
| 2 | Fix all console errors and warnings | DONE | Clean: only console.error for error handling, no debug logs |
| 3 | Mobile viewport zoom prevention | DONE | maximum-scale=1.0 on all 5 HTML pages |
| 4 | Consistent loading, error, and empty states | DONE | Already implemented: 15+ async flows with loading/error/empty patterns |
| 5 | Favicon and page title polish | DONE | Tiger SVG favicon, descriptive titles, correct active nav links |
| 6 | Agents page (War Room) mobile responsive | DONE | 480px: single-column bio grid, full-width config, compact scenario |
| 7 | SEO and social metadata cleanup | DONE | Meta descriptions + canonical URLs on all 5 pages |
| 8 | Deploy + full smoke test | DONE | All 6 JS + 4 Python pass. All SEO tags present. Pushed to master. |

## Previous Phase: Phase 30 — Lab Mobile + Social Previews + Reddit-Ready Polish (COMPLETE)

**Exit criterion MET:** Lab screener fully responsive on mobile (scrollable toolbar, touch-momentum table, full-viewport overlays, stacking filters). Dynamic OG meta tags on shared Lab URLs (position/sort/season in title). All chart overlays, profile popup, landing page, League Intel page responsive at 768px and 480px. 44px tap targets on buttons. OG images on all 5 pages. All 6 JS + 4 Python pass syntax/import checks. Pushed to master.

### Phase 30 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Lab screener mobile responsive layout | DONE | Scrollable toolbar, touch-momentum table, overflow-x hidden, full-viewport overlays |
| 2 | Chart overlays mobile-friendly | DONE | All overlays full-width, canvas scales, 44px tap targets, chart tabs wrap |
| 3 | Player profile popup mobile layout | DONE | Covered by Task 1-2 CSS (full-viewport, stacking header, scrollable tables) |
| 4 | Dynamic OG meta tags for shared URLs | DONE | Server route injects title/description from URL params (position, sort, season) |
| 5 | Touch-friendly filter interactions | DONE | Search type=search, autocomplete=off, native selects for mobile |
| 6 | Landing page mobile polish | DONE | Agent bio grid single-column at 480px, overflow-x hidden |
| 7 | League Intel page mobile layout | DONE | Connect button full-width 44px, overflow-x hidden |
| 8 | Create static OG image for social previews | DONE | SVG OG images already exist (1200x630) on all 5 pages |
| 9 | Deploy + mobile smoke test | DONE | All 6 JS + 4 Python pass. All pages have OG tags. Pushed to master. |

## Previous Phase: Phase 29 — Lab Audit: Database, Filters, Display, Polish (COMPLETE)

**Exit criterion:** Half-PPR scoring added. Snap counts and snap share columns available. Team filter works. Minimum games played filter works. Historical seasons 2020-2024 verified working with real career aggregates. Positional rank column added. Non-applicable stats show dash instead of 0. GP column header fixed. Tooltips on all abbreviations. Stat naming consistent. aDOT, CPOE, first downs, fumble split added to adapter and available as columns. Player profile card enriched with multi-year log. Deployed to Render.

### Phase 29 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Add missing stats to nflverse adapter + DB schema | DONE | 14 new columns: passing/rushing/receiving_first_downs, sacks_taken, sack_yards_lost, rushing/receiving/sack fumbles + lost, total fumbles/lost, offense_snaps/pct. Snap counts from snap_counts CSV. aDOT derived in live_data.py. ALTER TABLE migration. Red zone + explosive deferred (need PBP). |
| 2 | Half-PPR scoring + CPOE + EPA/play columns | DONE | Half-PPR + HPPR/G in Fantasy, CPOE + EPA/Play in Advanced. CPOE via RATE_METRICS. EPA/Play via new _enrich_with_epa_per_play. |
| 3 | Team filter + min games played filter | DONE | Team multi-select dropdown (32 teams) + min GP number input in filter bar. Backend supports teams[] array + min_gp HAVING clause. URL state serialized. Comic-strip styled chips. |
| 4 | Fix historical seasons + career aggregates | DONE | All 5 seasons (2020-2024) in DB. Season dropdown shows all + Career. Career aggregates correctly (Mahomes: 27,280 pass yds / 97 games). No duplicates. No code changes needed. |
| 5 | Positional rank + dash for N/A stats + GP header | DONE | pos_rank column (WR1, QB3, etc.) computed client-side, in PPR preset. N/A dash for non-primary stats (WR passing, RB passing, QB receiving when 0). GP header already correct. |
| 6 | Tooltips + stat naming cleanup | DONE | Tooltips on all 34 column headers via title attr. RuYPG/ReYPG/PaYPG renamed to Rush Yds/G, Rec Yds/G, Pass Yds/G in both NFL + college columns. |
| 7 | Enrich player profile card | DONE | Multi-season log, career totals row (bold), QB: INT/Sacks/CPOE, RB: 1st downs/fumbles, WR/TE: aDOT/1st downs. Age=integer, plural fix, draft badge, team color accent. |
| 8 | New stats as Lab columns | DONE | 9 new columns: Pass 1st, Sacks, Sack Yds, Rush 1st, Rec 1st, aDOT, FUM, FUM Lost, Snap%. Red zone + explosive deferred (need PBP adapter). |
| 9 | Chart enhancements + comparison tool | DONE | Radar: 3-4 player support. Scatter: trend line + R-squared toggle. Compare button in toolbar. Existing compare modal already has stat table + radar. |
| 10 | DVS transparency + remove test formulas + color legend | DONE | DVS info popover on click, dev formula blocklist (auto-remove from localStorage), color legend below table. |
| 11 | Player count fix + preset alignment + 562 bug | DONE | Error handlers reset count to 0 on fetch failure. Presets are curated selections (by design). Career vs 2024 verified different. |
| 12 | Deploy + smoke test | DONE | All 6 JS + 4 Python files pass. All features verified. Pushed to master. |

## Previous Phase: Phase 28 — Positional Heat Maps (COMPLETE)

**Exit criterion MET:** Lab screener has "Heat Map" button (NFL mode only, red border) that opens a 1000px overlay with canvas-rendered positional heat map. Backend endpoint GET /api/heatmap?position={QB|RB|WR|TE}&group={production|efficiency|usage} returns top 25 fantasy-relevant players with percentile rankings across 6 position-specific stats per group. Canvas renders dense color-coded grid: rows = players (name + team), columns = stats (rotated labels). Cells colored by percentile (red at 0th, yellow at 50th, green at 100th) with raw values displayed. Position selector tabs and stat group buttons (Production/Efficiency/Usage). Position-specific stat sets: QB gets passing stats, RB rushing, WR/TE receiving. "Higher is better" inversion for negative stats (TO, INT%). Export PNG with Razzle watermark. Color legend bar. Razzle design: sand bg, chunky chart border, Luckiest Guy title, Caveat subtitle, Space Mono data. Deployed to Render.

### Phase 28 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/heatmap endpoint | DONE | fetch_heatmap() in live_data.py. Queries player_week_stats JOIN players, aggregates season, computes derived stats + rate metrics. Percentiles within full position group. Position-specific stat sets. 3 stat groups per position. Tested: QB Lamar 99.2, WR Chase 99.7, RB Barkley 99.5, TE Bowers 98.4. |
| 2 | Heat map UI overlay + canvas rendering | DONE | 1000px overlay with position tabs + stat group buttons. Canvas: auto-sized grid, player names with team, rotated stat labels, cells colored red→yellow→green by percentile. 9 functions total. |
| 3 | PNG export + deploy + smoke test | DONE | Export PNG button. exportHeatMapPNG() with watermark. Downloads as razzle-heatmap-{pos}-{group}.png. All 6 JS pass syntax. Python imports clean. All 8 HTML IDs match. Committed and pushed. |

## Previous Phase: Phase 27 — Aging Curves (COMPLETE)

**Exit criterion MET:** Lab screener has "Aging Curves" button (NFL mode only, green border) that opens a 960px overlay with canvas-rendered aging curve chart. Backend endpoint GET /api/aging-curves?position={QB|RB|WR|TE} returns position-average PPG by integer age bucket (min 5 player-seasons) and top 10 individual player career arcs. Canvas chart: auto-scaled axes, dashed grid lines, Space Mono labels, age X-axis, PPG Y-axis. Thick position-colored baseline curve with bordered data dots. Individual player curves as dashed lines with toggleable legend pills (top 3 enabled by default). Position tabs switch data. Export PNG (800x520, watermark). Razzle design: sand bg, chunky chart border, Luckiest Guy title, Caveat subtitle. Deployed to Render.

### Phase 27 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend /api/aging-curves endpoint | DONE | fetch_aging_curves() in live_data.py. Queries player_week_stats JOIN players, groups by player+season, computes age_at_season. Baseline: avg PPG per integer age (min 5 samples). Top 10 players by career PPG (min 2 seasons). QB 16 ages, RB 12, WR 14, TE 14. |
| 2 | Aging curve chart UI + player overlay | DONE | 960px overlay with position tabs. Canvas chart: baseline (thick, position-colored), individual curves (dashed, toggleable). Legend with 10 player pills. Luckiest Guy title + Caveat subtitle. 8 functions total. |
| 3 | PNG export + deploy + smoke test | DONE | Export PNG button. 800x520 canvas with watermark. All 7 JS pass syntax. Python imports clean. All HTML IDs match. Committed and pushed. |

## Previous Phase: Phase 26 — Trade Value Chart (COMPLETE)

**Exit criterion MET:** Lab screener has "Trade Values" button (NFL mode only, orange border) that opens a 960px overlay with visual trade value chart. Players fetched from API, DVS computed client-side, rounded to trade values (0-100). Grouped by tier: Elite (85+, green), Star (70-84, blue), Starter (55-69, terracotta), Bench (<55, gray). Tier headers with rotated sticker badges. Player cards with position-colored left stripe, name, position badge, team, age, trade value bar + number. Position filter tabs (ALL/QB/RB/WR/TE). Canvas PNG export (800px portrait, watermark). Trade Calculator: two-side player search with debounced autocomplete, position-colored player chips with remove buttons, total value per side, balance indicator (FAIR green ≤10% / red with difference >10%). Razzle design system throughout. Deployed to Render.

### Phase 26 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Trade Value Chart overlay UI + data fetch | DONE | Trade Values button in toolbar (NFL mode only). Overlay with position filters, tier grouping, player cards with DVS-based trade values. 200 fantasy-relevant players. Razzle design: chunky borders, offset shadows, position colors, Caveat annotations. |
| 2 | Trade Value Chart PNG export | DONE | Export PNG button in overlay. 800px canvas: title, Caveat subtitle, tier sections with rotated badge stickers, player rows with position badge + name + team + value bar. Watermark baked in. Downloads as razzle-trade-values-{position}.png. |
| 3 | Trade Calculator | DONE | Two-side calculator below chart. Search with 150ms debounced autocomplete (top 8 matches). Player chips with position badge + TV + remove. Total value display. Balance indicator: FAIR (green, ≤10%) or A+N/B+N (red, >10%). Clear button per side. |
| 4 | Deploy + smoke test | DONE | All 4 JS pass syntax. Python imports clean. 13 trade value functions verified. All HTML IDs match. Pushed to master. |

## Previous Phase: Phase 25 — Code Quality Bugfixes (QA Audit) (COMPLETE)

**Exit criterion MET:** All critical and high-priority bugs from QA audit fixed. DVS age curve synced between backend (live_data.py) and frontend (app.js) — identical constants and interpolation. HTML sanitization added to lab.js (escapeHtml + escapeAttr on all user-visible text in renderTableBody). N+1 queries in prospect profiles eliminated (8 percentile queries → 1 batch, N dominator queries → 1 batch). Shared _STAT_SUM_COLS constant extracts 18 duplicated SUM columns across 5 functions. Dead code removed (career = career no-op, unused career_items). Deployed to Render.

### Phase 25 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix DVS age curve mismatch | DONE | app.js computeClientDVS() synced to live_data.py: QB rise_start 24→21, below-rise flat 0.7 (was 0.6 ramp), rise-to-peak 0.7+0.3x (was 0.85+0.15x). Verified: 25yo QB 18.5 PPG = 69.6 both places. |
| 2 | Add HTML sanitization to lab.js | DONE | escapeHtml() + escapeAttr() at top of lab.js. Applied to all player_name, full_name, team, school, conference, isText values and onclick params in renderTableBody(). XSS-safe. |
| 3 | Reduce N+1 queries in prospect profiles | DONE | Percentiles: 8 queries → 1 (batch SELECT all metrics). Dominator: N queries → 1 (batch OR with GROUP BY). Identical output, fewer round-trips. |
| 4 | Extract shared SELECT columns | DONE | _STAT_SUM_COLS constant (18 columns). Used in fetch_players, fetch_screener, fetch_player_seasons, fetch_player_profile, fetch_players_compare. |
| 5 | Clean up dead code | DONE | Removed career=career no-op, unused career_items variable. |
| 6 | Deploy + smoke test | DONE | All JS syntax OK. Python imports clean. All functions import. Pushed to master. |

## Previous Phase: Phase 24 — Saved Screener Views (COMPLETE)

**Exit criterion MET:** Lab screener has "Views" button in toolbar that opens a Saved Views overlay. Users can name and save current screener configuration (universe, position, columns, filters, sort, season, relevance) to localStorage. Saved views display with universe badge (NFL/PROSP/CFB), position badge (pos-colored), filter count, and date. Click to load restores full state (including UI controls) and refreshes data. Delete removes the view. Hover-lift cards. Razzle design system. Deployed to Render.

### Phase 24 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Saved Views system (save/load/delete + UI) | DONE | Views button in toolbar. savedViewsOverlay with save input + scrollable list. saveCurrentView() captures full state snapshot. loadSavedView() restores state, syncs UI (position chips, search, relevance, universe mode), calls applyUniverseUI + populateSeasonSelect + fetchData. deleteSavedView() by id. renderSavedViewsList() with universe/position badges, filter count, date. Chunky borders, hover lift, Caveat annotation. |
| 2 | Deploy + smoke test | DONE | lab.js, app.js, charts.js pass syntax. Python imports clean. Views button visible. All element IDs match. Pushed to master. |

## Previous Phase: Phase 23 — CSV Export + Server-Side Waitlist (COMPLETE)

**Exit criterion MET:** Lab screener has "Download CSV" button in share modal that exports current view (all rows × visible columns) as a CSV file with Razzle branding header. Works for all 3 universes (NFL/Prospects/College) using correct column definitions. File named razzle-{universe}-{position}-{season}.csv. Server-side waitlist endpoint (POST /api/waitlist) stores emails in SQLite waitlist table with UNIQUE constraint. Landing page submitWaitlist() upgraded from localStorage to API POST with ok/duplicate/error responses and Razzle personality messages. Deployed to Render.

### Phase 23 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | CSV export from Lab screener | DONE | exportCSV() in lab.js: branding header comments, column labels per universe, all rows, csvEscape for special chars. Download CSV button in share modal. |
| 2 | Server-side waitlist endpoint | DONE | POST /api/waitlist → SQLite waitlist table (email UNIQUE, created_at). Email validation. Three response states. Landing page uses async fetch POST. |
| 3 | Deploy + smoke test | DONE | All 6 JS pass syntax. All Python imports clean. 5 HTML pages + 2 SVGs present. Pushed to master. |

## Previous Phase: Phase 22 — Social Preview Cards + Open Graph Polish (COMPLETE)

**Exit criterion MET:** All 5 HTML pages have og:image meta tags pointing to branded social preview SVGs (1200x630). Two variants: og-image.svg (general branding) and og-image-lab.svg (Lab-specific with data counts). Full Twitter Card meta tags on all pages. og:url set per page. Preview images follow Razzle design system (sand bg, terracotta stripe, tiger emoji, position color dots, sticker badges, Caveat annotations). League Intel and 404 pages upgraded from zero og/twitter tags to fully covered. Deployed to Render.

### Phase 22 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create branded social preview image (SVG og:image) | DONE | og-image.svg (general) + og-image-lab.svg (Lab variant). 1200x630, sand bg, terracotta stripe, tiger, display text, position dots, sticker badges. |
| 2 | Add og:image + Twitter Card meta tags to all pages | DONE | All 5 pages: og:image, og:url, og:image:width/height, twitter:card/title/description/image. Lab uses lab variant. All absolute URLs. |
| 3 | Deploy + smoke test | DONE | All JS + Python pass. All 5 HTML + 2 SVGs present. All meta tags verified. Pushed to master. |

## Previous Phase: Phase 21 — Landing Page Draft Week Overhaul (COMPLETE)

**Exit criterion MET:** Landing page showcases the full product: NFL data + College data + Prospect scoring. Hero copy highlights dual-data platform ("NFL + College data. 1200+ NFL players. 9800+ college players. 329 prospects scored."). Feature cards cover all three universes (NFL Screener, College Screener, Prospect Profiles, Custom Formulas, DVS, Share to Reddit). New "Draft Season 2025" section with 4 linked cards (Big Board, Class Analytics, College Production, DVS) between features and mascot. Blue-light NCAA-themed section with Razzle design system (chunky borders, offset shadows, Caveat annotations, sticker badges). Meta tags updated for SEO/social. Footer credits sportsdataverse. Deployed to Render.

### Phase 21 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Update hero copy, meta tags, and feature cards for NFL+College+Prospects | DONE | Hero subtitle: "NFL + College data. 1200+ NFL players. 9800+ college players. 329 prospects scored." og:title/description updated. 6 feature cards: NFL Screener, College Screener, Prospect Profiles, Custom Formulas, DVS, Share to Reddit. Footer credits sportsdataverse. |
| 2 | Add Draft Season showcase section with prospect features | DONE | New blue-light section between features and mascot. 4 linked cards: Big Board, Class Analytics, College Production, DVS. Each with badge, description, Caveat annotation. Links to Lab with correct URL params. 2-col grid, mobile responsive. Chunky borders, offset shadows, hover lift. |
| 3 | Deploy + smoke test | DONE | All 6 JS pass syntax. All Python imports clean. 5 HTML pages + assets present. div tags balanced. All content checks pass. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 20 — Dynasty Comparison Cards + Quick Rankings Export (COMPLETE)

**Exit criterion MET:** NFL player comparison mode has full PNG export (side-by-side comparison cards with DVS, age, position-colored headers, key stats, radar overlay). Quick rankings export generates "Top N at Position" as a shareable PNG with DVS tier badges. Unified share modal provides copy URL + export PNG + suggested Reddit title. All exports follow Razzle design system (sand bg, chunky borders, watermark). Deployed to Render.

### Phase 20 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | NFL player comparison PNG export | DONE | exportNFLCompareImage() in charts.js: 800px canvas with sand bg, Caveat title, side-by-side player cards (position-colored stripes, DVS tier badges via client-side computation), stats comparison table (green best values), radar chart overlay, watermark. Export button in renderCompareTable(). Downloads as razzle-compare-{name1}-vs-{name2}.png. |
| 2 | Quick rankings export (Top N at Position) | DONE | "Export Rankings" button in NFL toolbar. Overlay: position/count/sort selectors. Fetches from API, computes DVS client-side, renders 800px canvas with ranked rows (position-colored rank badges, DVS tier badges, PPG). computeClientDVS() shared via app.js. Downloads as razzle-rankings-{pos}-topN.png. |
| 3 | Unified share modal with Reddit title suggestion | DONE | "Share" button (terracotta border) replaces separate Share URL + Export PNG. Modal: shareable URL + copy, Download PNG, auto-generated Reddit title adapting to universe/position/preset/season. Caveat annotation. Chunky borders, sand card bg. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check (6 files). All Python imports clean. All HTML pages + sprites + assets present. render.yaml correct. New features verified: NFL compare export, rankings export, share modal, shared DVS computation. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 19 — Player Age Enrichment + Dynasty Value Score (COMPLETE)

**Exit criterion MET:** Players table enriched with age from nflverse roster CSVs. Dynasty Value Score (DVS) computed for all skill position players: age-adjusted PPR production composite. DVS column in Lab screener with "Dynasty Rankings" preset. Creates "Razzle Dynasty Top 200" shareable content. Follows Razzle design system. Deployed to Render.

### Phase 19 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Enrich players with age/demographics from nflverse rosters | DONE | sync_rosters() fetches roster CSVs (2020-2024), extracts birth_date→age, years_exp, height, weight, college, status. 100% coverage for active 2024 players (562/562). Total 1074/1074 skill players enriched. Runs in CLI and server bootstrap. |
| 2 | Dynasty Value Score (DVS) backend computation | DONE | DVS = production_score × age_multiplier. Production = min(100, PPG×4). Position-specific age curves: QB peaks 26-30, RB 22-25, WR 24-28, TE 25-29. Enriched via _enrich_with_dynasty_value() on all screener results. Sortable via Python re-sort. Top: Lamar 99.2, Chase 94.8, Allen 92.4, Burrow 87.6. |
| 3 | DVS column + Dynasty Rankings preset in Lab | DONE | "Dynasty" group in COLUMNS: dynasty_value (DVS) and age. Tier-colored DVS badges (Elite 85+/green, Star 70+/blue, Starter 55+/orange). Updated "Dynasty" preset includes DVS+age. New "Dynasty Rankings" preset (DVS, Age, PPG, games, PPR, yards, TDs). Column picker shows Dynasty group. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check (lab/app/charts/warroom). All Python imports clean. DVS rankings verified: young elite producers at top, aging veterans properly discounted. Age sort works. render.yaml build includes roster sync via nflverse_adapter CLI. Pushed to master. |

## Previous Phase: Phase 18 — College-Prospect Integration (COMPLETE)

**Exit criterion MET:** Prospect profiles show college production stats alongside combine/athletic data. Backend links cfb_player_season_stats to combine_data prospects via normalized name matching with nickname expansion (Cam/Cameron etc). 117/329 prospects matched (unmatched are defensive/OL without offensive stats). Prospect profile modal has "College Production" section with blue accent title, position-specific career stats bar, dominator rating badge, season log table, and production arc chart. Prospect screener has 14 new College columns with "College Production" preset. Sort by college stats works with Python re-sort. Complete prospect report: athletic profile + college production + draft capital + NFL comp projection. Deployed to Render.

### Phase 18 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | College-prospect backend integration | DONE | fetch_prospect_profile returns college field with seasons, career totals, dominator_rating, derived efficiency. Nickname mapping (Cam/Cameron etc) + Jr/Sr suffix handling. 117/329 prospects matched. Batch enrichment for screener with college_total_yards/tds/ypc/cmp_pct/ypr/ypg. Python re-sort for college sort keys. |
| 2 | College production in prospect profile modal | DONE | Blue accent "College Production" section between RPS and Athletic Testing. Position-specific stats bar (QB: pass yds/TDs/CMP%, RB: rush/YPC, WR/TE: rec/Y/REC). Dominator rating badge (green/teal/yellow). Season log table with career totals. Production arc canvas chart. CB/WR compound position handling. |
| 3 | College production columns in prospect screener | DONE | 14 new College group columns (CFB GP/Yds/TD/PaYds/PaTD/CMP%/RuYds/RuTD/YPC/ReYds/ReTD/REC/Y/R/YPG). New "College Production" preset. Column picker shows College group. Sort by college_total_yards works (Dillon Gabriel 14950 yds leads). |
| 4 | Deploy + smoke test | DONE | All JS syntax passes. All Python imports clean. All assets present. render.yaml correct. Smoke tests: Hunter 1703 rec yds + 30.4% DOM, Sanders 8631 pass yds, Cam Ward 11150 pass yds (nickname match), Jeanty 4429 rush yds. Pushed to master. |

## Previous Phase: Phase 17 — College Production Stats (cfbfastR) (COMPLETE)

**Exit criterion MET:** College production stats from sportsdataverse play-level CSVs aggregated into per-player per-season totals in terminal.db (19,454 player-season rows, 9,875 unique players, 2020-2025). College stats API endpoints serve player data with search/filter/sort (GET /api/college/players, /api/college/player-profile/{id}, /api/college/filter-options). Lab has three-way universe toggle (NFL/Prospects/College) with 30 college-specific columns, 3 presets (Production/Efficiency/Draft Profile), blue accent. College player profiles clickable with position-specific headlines, season log, combine/measurables, NFL career cross-reference. URL state: ?u=college&season=2024. Follows Razzle design system. Deployed to Render.

### Phase 17 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | cfbfastR adapter — play-level CSV aggregation | DONE | adapters/cfbfastr_adapter.py fetches play-level CSVs from sportsdataverse GitHub (2020-2025), aggregates into per-player per-season totals. 19,454 player-season rows, 9,875 unique players. Passing, rushing, receiving stats with correct TD attribution (handles both QB-credited and receiver-credited patterns). Position inferred from stats, refined via combine/draft data (918 refinements). Bootstrap in server.py + render.yaml updated. |
| 2 | College stats API endpoints | DONE | GET /api/college/players (paginated, search/position/team/conference/season/sort with derived sorts), GET /api/college/player-profile/{id} (all seasons + career totals + combine/draft), GET /api/college/filter-options (6 seasons, 330 teams, 50 conferences). Derived efficiency stats: CMP%, YPC, Y/REC, catch_rate, per-game avgs. Python re-sort for derived metrics. |
| 3 | College mode in Lab screener | DONE | Three-way universe toggle (NFL/Prospects/College). 30 college columns (Production/Usage/Efficiency/Per Game). 3 presets (Production, Efficiency, Draft Profile). Blue accent mode. College player profiles with position-specific headlines, season log, combine, NFL career data. URL state ?u=college&season=2024. Season selector 2020-2025. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. All Python imports clean. All frontend assets present. render.yaml correct (cfbfastr 2020-2025 at build). Smoke tests pass: 3887 college players, sort/filter/profiles work, combine cross-reference. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 16 — Draft Class Analytics + Cross-Year Comparison (COMPLETE)

**Exit criterion MET:** Lab prospect mode has "Class Analytics" button that opens draft class comparison view. Shows year-over-year analysis for each position (2020-2026): average RPS, tier distribution (Elite/Premium/Solid/Flier counts), class grade badge (A/B/C/D based on avg RPS + elite/premium ratio), top prospect per year. Canvas-rendered bar chart of avg RPS by year with grade-colored bars. Class cards grid with tier distribution bars, prospect counts, top prospect info. Position filter tabs (ALL/QB/RB/WR/TE). Exportable as PNG with Razzle watermark (800px wide portrait). Follows Razzle design system. Deployed to Render.

### Phase 16 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Draft class analytics API endpoint | DONE | GET /api/draft-class-analytics?position=WR. Reuses fetch_prospect_scores per year, computes avg RPS, tier distribution, class grade (A/B/C/D based on avg RPS + elite/premium ratio), top prospect. Covers 2020-2026 draft classes. Works for all positions and ALL. |
| 2 | Draft class analytics view in Lab frontend | DONE | "Class Analytics" button in prospect toolbar. Overlay with position filter tabs, canvas bar chart (grade-colored bars, gridlines, labels), class cards grid (grade badge, stats, tier distribution bar, top prospect). Razzle design: chunky 3px borders, offset shadows, sand bg, Caveat annotations. Mobile responsive grid. |
| 3 | Draft class analytics PNG export + deploy | DONE | Canvas-rendered export: title, bar chart with grade badges, class cards with tier bars. Portrait 800px layout. Razzle watermark. Downloads as razzle-class-analytics-{position}.png. All JS syntax passes. Python imports clean. Pushed to master. |

## Previous Phase: Phase 15 — Unified Prospect Report Cards (COMPLETE)

**Exit criterion MET:** Click any prospect name in Lab → profile card shows RPS score bar with tier badge (Elite/Premium/Solid/Flier), component breakdown (Athletic 60% / Draft Cap 30% / Size 10%), athletic percentile bars, spider chart, NFL athletic comps with comp-based stat projections (weighted average of comp NFL careers by similarity), confidence indicator. Enhanced PNG export captures full report card with all sections. Follows Razzle design system. Deployed to Render.

### Phase 15 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | RPS score + tier badge in prospect profile | DONE | Client-side RPS computation from profile percentiles (same formula as backend). RPS score bar colored by tier, rotated tier sticker badge, component breakdown boxes (Athletic/Draft Cap/Size) with dashed borders. Chunky 3px card border with offset shadow. |
| 2 | Comp-based stat projections | DONE | computeCompProjection() computes weighted average of comp NFL careers by similarity %. Position-specific stats (QB: pass, RB: rush+rec, WR/TE: rec). Confidence indicator based on average comp similarity. Caveat annotation. Only shows when comps have NFL data. |
| 3 | Enhanced prospect report card PNG export | DONE | Canvas-rendered export now includes: header, measurables, RPS section (score bar + tier badge + component breakdown), athletic testing bars, spider chart, comp cards (similarity badge + name + stats), projection boxes. Portrait layout (800px wide). Razzle watermark baked in. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. All HTML pages + assets present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 14 — Composite Prospect Scoring + Big Board (COMPLETE)

**Exit criterion MET:** Lab prospect mode has "Big Board" button that opens visual ranked board scored by Razzle Prospect Score (RPS). RPS = weighted composite of avg athletic percentile (60%) + draft capital value (30%) + position-relative size score (10%). Big Board shows ranked prospects with position filter tabs (ALL/QB/RB/WR/TE), tier bands (Elite 85+/Premium 70-85/Solid 55-70/Flier <55) with rotated sticker badges, ranked prospect cards with RPS score bars, key combine metrics, draft info. Exportable as PNG with Razzle watermark. 329 total prospects scored for 2025 draft class. Follows Razzle design system. Deployed to Render.

### Phase 14 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Razzle Prospect Score (RPS) backend | DONE | New endpoint GET /api/prospect-scores. RPS formula: athletic_avg*0.6 + draft_capital*0.3 + size_score*0.1. Draft capital: pick 1=100, linear decay to pick 256=20, undrafted=20. Size score: position-relative weight percentile. Handles missing combine data gracefully. 329 prospects scored for 2025. |
| 2 | Big Board view in Lab frontend | DONE | "Big Board" button in prospect toolbar. Overlay with position filter tabs (ALL/QB/RB/WR/TE), tier bands (Elite/Premium/Solid/Flier) with rotated sticker badges. Ranked prospect cards: rank circle, name, position chip, school, draft info, RPS bar with tier color, key metrics. Chunky 2px borders, offset shadows, hover lift. Mobile responsive. |
| 3 | Big Board PNG export | DONE | Canvas-rendered export with title, tier sections, prospect rows with RPS bars, position chips, combine metrics. Portrait layout (800px wide). Razzle watermark baked in. Downloads as razzle-bigboard-{position}-{year}.png. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. RPS endpoint returns correct data for all positions. Render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 13 — Historical Athletic Comps + Prospect Comparisons (COMPLETE)

**Exit criterion MET:** Prospect profile cards show top 3 NFL historical athletic comps (players with most similar combine profiles at same position, Euclidean distance on percentile-normalized metrics, NFL career boost). Prospect comparison mode: select 2-3 prospects → side-by-side spider chart overlays with different colors + combine stat table with percentiles. Draft class tier view: "Tiers" button in prospect toolbar, position selector, prospects grouped by avg athletic percentile (Elite 80+, Above Avg, Avg, Below Avg, No Data) with sticker badge tier labels. All exportable as PNG with Razzle watermark. Follows Razzle design system. Deployed to Render.

### Phase 13 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Historical athletic comps API + UI | DONE | Backend: /api/prospect-comps endpoint. Euclidean distance on percentile-normalized combine metrics (40, bench, vert, broad, cone, shuttle). NFL career boost in sorting. Frontend: "NFL Athletic Comps" section in prospect profile card with top 3 comp cards showing similarity %, draft info, career stats. Chunky borders, offset shadows, colored similarity badges. Mobile responsive. |
| 2 | Prospect comparison mode | DONE | Backend: /api/prospects/compare returns multiple prospects with percentiles. Frontend: prospect checkboxes work in Lab, Compare button opens overlay with side-by-side spider chart (2-3 prospects, different colors) + combine stat comparison table with percentiles. Best values highlighted green. PNG export with watermark. Mobile responsive. |
| 3 | Draft class position tier view | DONE | Backend: /api/prospect-tiers returns prospects grouped by avg athletic percentile tier (Elite 80+, Above Avg 60-80, Avg 40-60, Below Avg <40, No Data). Frontend: "Tiers" button in prospect mode toolbar, position selector (QB/RB/WR/TE), tier grid with sticker badges, prospect cards with avg percentile + key metrics. PNG export with watermark. Responsive grid layout. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. All Python imports clean. All HTML pages + assets present. render.yaml correct. All 3 new endpoints (prospect-comps, prospects/compare, prospect-tiers) return correct data. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 12 — Prospect Cards + Athletic Percentiles (COMPLETE)

**Exit criterion MET:** Click any prospect name in Lab prospect mode → rich profile card opens with blue prospect accent header, PROSPECT badge, combine metrics as percentile bars (color-coded by position-group rank: red→orange→yellow→teal→green), athletic spider chart (canvas radar with percentile axes), measurables bar, draft capital, NFL career stats (if available). Prospect cards exportable as PNG with Razzle watermark. Follows Razzle design system (chunky borders, offset shadows, sand bg, Space Mono data, Caveat annotations). Mobile responsive. Deployed to Render.

### Phase 12 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Prospect profile cards | DONE | Click prospect name → rich modal with blue prospect accent header, PROSPECT badge, school + draft info, combine metrics, measurables bar, NFL career stats (if any). Export PNG with watermark. Backend: /api/prospect-profile endpoint with position-group percentile computation. Mobile responsive. |
| 2 | Athletic percentile bars | DONE | Each combine metric (40, bench, vert, broad, cone, shuttle) rendered as horizontal percentile bar. Percentile computed against all same-position prospects in DB. Color gradient: red (0-20) → orange → yellow → teal → green (80-100). Inverted for time metrics (lower = better). Space Mono numbers, chunky bar styling. |
| 3 | Prospect combine spider chart | DONE | Canvas-rendered radar chart showing combine percentiles on 0-100 scale. Blue fill (prospect accent), grid rings at 20/40/60/80/100, axis lines, percentile-colored labels. Handles missing metrics by filtering axes. Caveat title annotation. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python server imports clean. All HTML pages, JS files, CSS, sprites present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 11 — Positional Heat Maps + Breakout Detection (COMPLETE)

**Exit criterion MET:** Lab has a Heat Map tab in the chart panel: select position (QB/RB/WR/TE) → see top 15/20/30 players × stats grid with cells colored by percentile rank (red→yellow→green). 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency). Exportable as PNG with Razzle watermark. Breakout detection: backend computes 50%+ YoY PPR increase, BRK% column in screener with green pill badges, breakout badge in player profile (sticker aesthetic). All follows Razzle design system. Deployed to Render.

### Phase 11 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Positional heat map visualization | DONE | Heat Map tab in chart panel. Position selector (QB/RB/WR/TE), 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency), configurable top 15/20/30. Canvas-rendered grid with percentile-colored cells (red→yellow→green). Player names + team badges on Y-axis, rotated stat headers on X-axis. Razzle design: chunky borders, sand bg, Luckiest Guy/Space Mono/Caveat fonts, watermark. Horizontal scroll on mobile. |
| 2 | Heat map PNG export | DONE | "Export PNG" button visible only in heat map tab. Downloads canvas as razzle-heatmap-{position}.png. Watermark already baked into canvas render. |
| 3 | Breakout detection badges | DONE | Backend _enrich_with_breakout() computes max YoY PPR increase (20-point threshold). breakout_pct field in API. BRK% column in screener (Breakout group, in Dynasty preset). Green pill badge with +N% in screener cells >=50%. Breakout badge in player profile (sticker: rotated, green, chunky border). |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. All HTML pages, JS files, CSS, sprites present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 10 — Player Profiles + Lab Enhancement (COMPLETE)

**Exit criterion MET:** Click any player name in the Lab screener → rich profile modal opens with position-colored header, career headline stats bar (position-specific), season-by-season breakdown table with career totals, combine/draft data grid (if available), and career arc canvas chart. Profile PNG export with Razzle watermark. Mobile responsive. Follows Razzle design system (chunky borders, offset shadows, position colors, sand bg).

### Phase 10 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Player profile detail modal | DONE | Click player name → profile modal with position-colored header, career headline stats bar (position-specific), season-by-season table with career totals, combine/draft data grid, career arc chart. Razzle design system: chunky borders, offset shadows, position colors. Close on click-outside. Mobile responsive. |
| 2 | Profile career arc chart | DONE | Canvas chart in profile: PPR per season line with filled area, position-colored, data point dots with value labels, Y-axis gridlines, season tick labels. Handles single-season players. |
| 3 | Profile image export | DONE | "Export PNG" button in profile header. Canvas-rendered profile (header, stats bar, season table) with Razzle watermark. Downloads as razzle-profile-{name}.png. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python server imports clean. All HTML pages, JS files, CSS, sprites present. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 9 — Polish + Formula Store (COMPLETE)

**Exit criterion MET:** Complete product loop works: land on home → explore Lab → create formula → publish to store → connect Sleeper → enter War Room → run agent scenario → see league-contextualized brief. Formula Store has 10 seed community formulas with search/filter/sort, publishing flow, ratings/reviews. Custom 404 page. All pages have loading/error/empty states. Performance verified (pagination, 60fps canvas, indexed DB). Everything works, design is cohesive.

### Phase 9 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula Store UI | DONE | Store overlay with 10 seed community formulas, search/filter by position, sort by popular/rating/newest, formula cards with chunky borders + offset shadows, install/uninstall, star ratings, stat preview (weights hidden), creator names. Mobile responsive. |
| 2 | Formula publishing | DONE | "Publish" button on each saved formula in formula builder. Publish modal with name, creator name, description, position tag checkboxes. Published formulas saved to razzle_store_published localStorage and appear in store. Weights hidden (stat names only). "Published" badge shows on already-published formulas. |
| 3 | Formula ratings/reviews | DONE | Clickable 1-5 star rating on each store card with hover preview. Review text input appears after rating. Reviews persist in razzle_store_reviews localStorage. Sort by popular/top rated/newest. User review displayed on card after submission. |
| 4 | Full UX polish pass | DONE | Custom 404 page with Razzle branding (tiger mascot, "checked the film" copy, navigation links). Server-side 404 handler for non-API routes. Shared .error-msg and .empty-msg CSS classes. All pages already have loading/error/empty states with Razzle personality ("pulling film...", "fumbled the data fetch..."). All pages mobile responsive. |
| 5 | Performance audit | DONE | Screener pagination verified (100/page, SQL LIMIT/OFFSET). Canvas game loop uses requestAnimationFrame with delta time capping (60fps). Database indexes on search_name, position, team, player_id, season, fantasy_points_ppr. API caps results at 1000. No memory leaks or unbounded arrays. System well-optimized for target scale. |
| 6 | Deploy + smoke test | DONE | All JS files pass syntax check. All Python modules import cleanly. All HTML pages present. All assets (sprites, personas, favicon) verified. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 8 — War Room: Context Bridge + Free/Paid Gating (COMPLETE)

**Exit criterion MET:** Free user asks a question → gets generic agent analysis (Generic Mode badge, no league context in prompts). Connected Sleeper user asks the same question → gets league-contextualized answer that references their roster and rivals (League Context Mode badge, roster/rivals/record in prompts, rules instruct personalized analysis). Pro upsell card with blurred preview for non-connected users. Home page demo has 55 briefings with agent bio cards showing pixel avatars.

### Phase 8 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Lab context feed | DONE | Lab saves selected players + stats + formulas to localStorage (razzle_lab_context). War Room reads via getLabContext(), injects "What The Lab Knows" section into agent prompts. Context badges in scenario panel show active/inactive state for Lab and Sleeper. |
| 2 | League Intel context feed | DONE | League-intel.html saves league metadata (name, type, scoring, teams) on loadLeagues() and roster + rivals on toggleLeague() to razzle_league_context localStorage. War Room reads via getLeagueContext(), formats with record, roster, top 5 rival managers + their top players. Disconnect clears context. 7-day TTL. |
| 3 | Free vs. paid prompt tiers | DONE | Automatic mode detection via isLeagueContextMode(). Free/generic mode: no league context, rules instruct general analysis. League context mode: rules instruct roster-specific, rival-aware analysis. Mode badge in scenario panel shows current state. |
| 4 | Paywall UI gating | DONE | Pro upsell card with blurred/redacted league context preview. Visible only in generic mode (no Sleeper). "Connect Sleeper to Unlock" CTA links to league-intel. Hidden when league context available. Razzle design system: chunky orange border, offset shadow, handwritten text, blurred preview lines. |
| 5 | Home page War Room demo upgrade | DONE | 55 briefings (up from 33): Razzle 11, Scout 11, Diplomat 9, Quant 8, Medical 8, Historian 8. New content covers bye week alerts, playoff clinch scenarios, trade vetoes, coaching changes, injury sell-highs, FAAB budget strategy, historical comps. Rotation picks 3 from different agents. |
| 6 | Agent bio cards | DONE | 6 bio cards on landing page ("Meet the Team" grid) and War Room hero. Pixel avatars from sprite sheets (background-position into 112x96 PNGs). Position-colored stripes, agent names, roles, specialty one-liners. Razzle design: 3px borders, offset shadows, slight rotation, hover lift. Mobile responsive (3→2 cols at 768px). |

## Previous Phase: Phase 7 — War Room: Agent Personas + Scenario Runner (COMPLETE)

**Exit criterion MET:** User types scenario → 5 specialists respond in parallel with per-agent status tracking → Razzle synthesizes with peer insights → briefing cards render with structured analysis (Razzle at top, specialists collapsible below). Urgency badges, markdown rendering, error states. Works with any OpenRouter-compatible API key.

### Phase 7 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Agent persona files | DONE | 6 markdown files in agent-personas/: razzle.md (Chief of Staff), medical.md, scout.md, diplomat.md, quant.md, historian.md. Adapted from FDL personas with Razzle brand voice, mandatory output sections per roadmap spec |
| 2 | Agent config panel | DONE | Config toggle + sand-bg overlay panel in War Room dark zone. Shared API key with "Apply to All", model selector (default openrouter/auto), base URL, per-agent key overrides with color dots. localStorage persistence via razzle_agent_config key. Razzle design system: chunky borders, offset shadows, font-display labels, font-mono inputs, font-hand hints |
| 3 | Scenario input panel | DONE | Sand-bg card in dark zone below canvas. Textarea with Caveat placeholder, 6 pre-loaded example scenario chips, "Run All Agents" primary button + per-agent run buttons with color dots. Loading states ("pulling film..."). Custom events dispatched for LLM integration (Task 4). Mobile responsive. |
| 4 | LLM integration | DONE | Browser-side fetch to OpenRouter-compatible API. loadPersona() fetches persona markdown from /agent-personas/. callLLM() with 20s AbortController timeout, temperature 0.3. Error handling for missing key, timeout, bad response. executeAgent() composes persona + rules + scenario into system/user messages. runAllAgents() runs 5 specialists in parallel via Promise.all, then Razzle synthesizes with peer insights. Custom events dispatched for rendering. |
| 5 | Specialist agent execution | DONE | 5 specialists fire in parallel via Promise.all. Per-agent status tracker chips (running/done/error) with colored indicators. Individual try/catch per agent — one failing doesn't block others. Canvas bubbles + UI status chips update in real-time. |
| 6 | Razzle orchestration | DONE | Already implemented in runAllAgents(): await Promise.all for 5 specialists, then Razzle runs with peerInsights from successful results. razzle.md persona defines Urgency Tier, Conflicts and Resolution, GM Decision Needed sections. buildRules() adds synthesis-specific rules. Edge cases: all fail (early return), partial failures, missing key, LLM error. |
| 7 | Response rendering | DONE | Briefing cards render in War Room dark zone via razzle:all-agents-done and razzle:agent-result event listeners. Razzle card at top (prominent, orange accent border, expanded). Specialist cards below (collapsible, start collapsed). Simple markdown→HTML renderer for agent responses. Urgency badge detection (URGENT/MONITOR/OPPORTUNITY) on Razzle card. Error states per card. CSS: chunky 3px borders, offset shadows, font-display headings, font-mono data, position-colored dots. Mobile responsive. |

## Previous Phase: Phase 6 — War Room: Pixel Engine + Agent Canvas (COMPLETE)

### Phase 6 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | agents.html page | DONE | War Room hero (sand bg, Luckiest Guy, agent badges), dark mode canvas zone, nav on all pages |
| 2 | Pixel agent sprite sheets | DONE | 6 character PNGs (112×96, 7×4 grid of 16×24 frames) ported from FDL to frontend/assets/characters/ |
| 3 | Canvas War Room engine | DONE | 30×22 tile grid, wood floor, turf war table, 6 desks, collision map. warroom.js (full canvas engine) |
| 4 | Agent AI + animation | DONE | State machine (IDLE/WALK/WORK/THINK/DISCUSS/COFFEE/CELEBRATE), walk frames [0,1,2,1] at 150ms, directional facing |
| 5 | Agent selection + camera | DONE | Click select (dashed ellipse), camera follow, arrow key controls, name tags with role colors |
| 6 | Agent roster sidebar | DONE | Toggleable panel: pixel avatars, names, roles, live activity status, click to select + camera follow |

**Exit criterion MET:** agents.html loads with live pixel War Room. 6 agents walk around autonomously, work at desks, visit war table. Click to select, camera follows, roster sidebar. Room has Razzle comic-strip aesthetic with draft board, TVs, whiteboard, trophy case.

---

## Previous Phase: Pre-Draft Enhancement

### Pre-Draft Enhancement Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Multi-season NFL data (2020-2024) | DONE | 1238 players, 28026 stat rows across 5 seasons. Career aggregates enabled. |
| 2 | Career view in Lab | DONE | Season selector includes "Career" option, aggregates all seasons. Dynasty preset includes seasons column. |
| 3 | Bootstrap on startup | DONE | server.py lifespan bootstrap syncs data if DB empty (Render cold start resilience) |
| 4 | render.yaml multi-season | DONE | Build command syncs 2020-2024 seasons |
| 5 | Advanced metrics | DONE | target_share, air_yards_share, WOPR, RACR, EPA (pass/rec/rush), DAKOTA from nflverse rate stats |
| 6 | Efficiency columns | DONE | Y/CAR, Y/REC, Y/TGT, Catch%, CMP%, Y/ATT derived from aggregates |
| 7 | Per-game averages | DONE | REC/G, TGT/G, RuYPG, ReYPG, PaYPG computed per player |
| 8 | New presets | DONE | Efficiency + Advanced presets added to Lab toolbar |
| 9 | Season trend charts | DONE | Weekly + By Season toggle in trend chart, /api/players/{id}/seasons endpoint |
| 10 | Filter safeguards | DONE | Derived/rate metrics excluded from HAVING clause and filter dropdown |

---

### Pre-Launch Polish (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | War Room demo rotation | DONE | 33 briefings across 6 agent types (Razzle, Scout, Diplomat, Quant, Medical, Historian), shuffle on each visit, "shuffle briefings" button |
| 2 | Mobile responsiveness | DONE | Media queries at 768px and 480px breakpoints for all pages (landing, Lab, League Intel) |
| 3 | Design audit | DONE | Replaced raw hex colors in demo section with CSS variables, added SVG favicon |
| 4 | Deploy to Render | DONE | Pushed to master, Render auto-deploys |

**Exit criterion MET:** All pages responsive on mobile, War Room demo rotates per visit, design consistent with DESIGN.md, deployed to Render.

---

## Previous Phases

### Phase 1b — College/Prospect Data (COMPLETE)

### Phase 1b Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | College adapter | DONE | adapters/college_adapter.py — fetches combine.csv + draft_picks.csv from nflverse |
| 2 | Combine data | DONE | 2413 entries (2020-2026), 40-yard, bench, vertical, broad jump, cone, shuttle |
| 3 | Draft picks data | DONE | 1549 picks (2020-2025), draft capital + career NFL stats |
| 4 | Prospect API | DONE | GET /api/prospects with sort/filter/search, GET /api/prospect-options |
| 5 | NFL/Prospect toggle | DONE | Universe toggle in Lab toolbar, blue accent for prospect mode |
| 6 | Prospect column presets | DONE | Combine, Athletic, Draft Capital, NFL Production presets |
| 7 | URL state for prospects | DONE | ?u=prospects&draft_year=2025 — full state serialization |

**Exit criterion MET:** Toggle to Prospects, see 2025 draft class sorted by pick, filter by position, sort by 40-yard dash.

---

## Previous Phases

### Phase 4 — Landing Page + Sleeper Connection (COMPLETE)

### Pre-Launch Polish (COMPLETE)

### Phase 0 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project structure | DONE | /frontend, /backend, /adapters, /data, /scripts created |
| 2 | nflverse adapter | DONE | Fetches weekly CSVs from GitHub, 612 players, 5597 stat rows, 40+ metrics |
| 3 | Serving layer (FastAPI) | DONE | /api/health, /api/players, /api/screener/query, /api/filter-options |
| 4 | Local dev confirmed | DONE | Frontend + API serving from single FastAPI app |
| 5 | Deploy to Render | READY | render.yaml updated for Python web service, needs push |

**Exit criterion MET:** Browser hits API, returns real 2024 NFL player stats from SQLite.

---

### Phase 1 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Screener table UI | DONE | Sortable columns, sticky player name, position badges, horizontal scroll |
| 2 | Advanced filtering | DONE | Modal: pick stat + operator + value, filter tags with remove, AND logic |
| 3 | Column picker | DONE | Slide-out panel, grouped by category, checkbox toggles |
| 4 | Season/week selector | DONE | Season dropdown from API. Week-level breakdown deferred to Phase 1b |
| 5 | Relevance tier toggle | DONE | "Fantasy Only" vs "All Players" button |
| 6 | Search + URL state | DONE | Full state serialization (pos, search, sort, filters, columns, pagination) |
| 7 | NFL/NCAA toggle | DEFERRED | Requires college_adapter.py — will build in Phase 1b or Phase 2 |

**Exit criterion MET.**

---

### Phase 2 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula builder UI | DONE | Modal: stat dropdowns + weight percentage + name, save/delete |
| 2 | Formula persistence | DONE | localStorage, formulas register as sortable COLUMNS in screener |
| 3 | Radar charts | DONE | Canvas API, 6-stat polygon, two-player overlay, configurable stats |
| 4 | Scatter plots | DONE | Any stat × any stat, position-colored dots, labeled players |
| 5 | Trend charts | DONE | Week-by-week line chart via /api/players/{id}/weeks endpoint |
| 6 | Comparison mode | DONE | Checkbox select → side-by-side table + radar overlay |

**Exit criterion MET:** Create a custom WR formula, sort screener by it, open radar chart comparing two players.

---

## Completed Work

### Pre-Phase 0 (Design & Planning)
- [x] Brand name chosen: Razzle
- [x] Domain bought: razzle.lol (Namecheap)
- [x] Mascot designed: Bengal tiger, Chief of Staff
- [x] Theme prototype built: index.html (Anthropic sand, Garfield font, chunky borders)
- [x] Design guide written: docs/DESIGN.md
- [x] Roadmap written: docs/ROADMAP.md
- [x] GitHub repo created: swaggerdagger987/razzle (private)
- [x] Render static site connected (landing page deploying)
- [x] Custom domain DNS configured (pending SSL cert)

### Phase 0 — Foundation
- [x] Project folder structure: /frontend, /backend, /adapters, /data, /scripts
- [x] nflverse adapter: adapters/nflverse_adapter.py — fetches player_stats CSVs, normalizes to SQLite
- [x] Database schema: players, player_week_stats, player_week_metrics, sync_state tables
- [x] FastAPI server: backend/server.py + backend/live_data.py
- [x] API endpoints: /api/health, /api/players, /api/screener/query, /api/filter-options
- [x] Data verified: 612 players, 2024 season, top scorers match real NFL data
- [x] render.yaml updated for Python web service with build-time data sync

### Phase 1 — The Lab: Core Screener
- [x] lab.html: Full screener page with toolbar, filter bar, data table, footer
- [x] lab.js: Screener state management, API integration, rendering
- [x] styles.css: Shared stylesheet with Razzle design system
- [x] app.js: Shared utilities (API fetch, formatting)
- [x] 5 column presets: PPR, Passing, Rushing, Receiving, Dynasty
- [x] 20 sortable columns across Fantasy, Passing, Rushing, Receiving, Totals groups
- [x] Advanced filter modal with stat/operator/value
- [x] Full URL state serialization for sharing

### Phase 2 — Formulas + Visualizations
- [x] Formula builder: modal UI, stat dropdowns + weight sliders, save/delete
- [x] Formula persistence: localStorage, formulas become sortable columns in screener
- [x] Radar charts: Canvas API, 6-stat pentagon, player overlay comparison
- [x] Scatter plots: any stat vs any stat, position-colored dots, labeled top players
- [x] Trend charts: week-by-week stat lines with filled area, per-player
- [x] Comparison mode: select players via checkboxes, side-by-side stat table + radar overlay
- [x] API: /api/players/{id}/weeks for trend data, /api/players/compare for multi-player stats
- [x] Player selection: checkbox column in screener, max 5 players, compare button

### Phase 3 — Sharing Engine + Watermark
- [x] Watermark: fixed "built different — razzle.lol" on Lab page, semi-transparent, slightly rotated
- [x] Image export: Canvas-rendered PNG of screener table with position badges, stats, watermark
- [x] Export PNG button in toolbar, auto-downloads razzle-lab-{season}.png
- [x] og:meta tags for link previews (og:title, og:description, twitter:card)
- [x] Share URL button already built in Phase 1

### Phase 1b — College/Prospect Data
- [x] college_adapter.py: fetches combine.csv and draft_picks.csv from nflverse GitHub releases
- [x] combine_data table: 2413 entries across 7 draft classes (2020-2026), full athletic testing
- [x] draft_picks table: 1549 picks with draft capital, career NFL stats, college info
- [x] Prospect API: GET /api/prospects (search, position, school, sort, draft_year), GET /api/prospect-options
- [x] NFL team name → abbreviation mapping for combine data (TENNESSEE TITANS → TEN)
- [x] Universe toggle: NFL/Prospects button in Lab toolbar with blue accent for prospect mode
- [x] Prospect columns: Draft (Rd, Pick, Team), Measurables (HT, WT), Athletic (40, Bench, Vert, Broad, Cone, Shuttle), NFL Career
- [x] 4 prospect presets: Combine, Athletic, Draft Capital, NFL Production
- [x] URL state: ?u=prospects&draft_year=2025 serialization, shareable prospect views
- [x] Season selector becomes draft year selector in prospect mode
- [x] render.yaml updated to sync college data at build time

### Phase 4 — Landing Page + Sleeper Connection
- [x] Landing page rebuilt: hero, 6 feature cards, mascot section, War Room demo, waitlist
- [x] War Room demo: 3 anonymized agent briefings with redacted content (Razzle, Scout, Diplomat)
- [x] Sleeper connection: league-intel.html with username input, Sleeper API integration
- [x] League Intel: shows leagues, expandable roster view with position groups, W-L record
- [x] Email waitlist capture (localStorage for now, backend later)

### Pre-Draft Enhancement
- [x] Multi-season NFL data: 5 seasons (2020-2024), 1238 players, 28026 stat rows
- [x] Career view: season selector "Career" option aggregates all seasons
- [x] Seasons column added to NFL columns + Dynasty preset
- [x] Backend career mode: fetch_players, fetch_screener, fetch_players_compare all support season="career"
- [x] Bootstrap on startup: server.py lifespan auto-syncs data if DB empty
- [x] render.yaml updated to sync 2020-2024 at build time
- [x] Advanced metrics: target_share, air_yards_share, WOPR, RACR, passing/receiving/rushing EPA, DAKOTA
- [x] Efficiency columns: Y/CAR, Y/REC, Y/TGT, Catch%, CMP%, Y/ATT (derived from aggregates)
- [x] Per-game averages: REC/G, TGT/G, RuYPG, ReYPG, PaYPG
- [x] Efficiency + Advanced column presets added to Lab toolbar
- [x] Rate metrics enrichment: secondary query fetches averages from player_week_metrics table
- [x] Python re-sort for derived/rate metric sorts (SQL sorts by PPR, Python re-sorts)
- [x] Season trend charts: Weekly + By Season toggle, /api/players/{id}/seasons endpoint
- [x] Season trend shows career arc across all available seasons (2020-2024)
- [x] Filter safeguards: derived metrics excluded from SQL HAVING and filter dropdown

### Pre-Launch Polish
- [x] War Room demo rotation: 33 briefings across 6 agent types, shuffled on each page load
- [x] Agent types: Razzle (7), Scout (7), Diplomat (6), Quant (5), Medical (4), Historian (4)
- [x] "Shuffle briefings" button for visitors to see more demo content
- [x] Mobile responsive: all pages (landing, Lab, League Intel) with 768px and 480px breakpoints
- [x] Nav, toolbar, table, modals, feature grid, mascot section, forms all adapt to mobile
- [x] Design audit: replaced raw hex colors in War Room demo with CSS variables
- [x] SVG favicon (tiger emoji) added to all pages
- [x] Deployed to Render

### Phase 10 — Player Profiles + Lab Enhancement
- [x] Player profile detail modal: click player name → rich modal with position-colored header, career headline stats bar
- [x] Position-specific headline stats: QB (pass yds/TDs/rush yds), RB (rush/rec yds/TDs), WR/TE (rec yds/TDs/receptions)
- [x] Season-by-season breakdown table with position-specific columns and career totals row
- [x] Combine/draft data grid: round, pick, height, weight, 40-yard, bench, vertical, broad, cone, shuttle
- [x] Career arc canvas chart: PPR per season line with filled area, position-colored, data point dots with value labels
- [x] Profile image export: canvas-rendered PNG with header, stats bar, season table, Razzle watermark
- [x] Backend: fetch_player_profile with season aggregates, derived stats enrichment, combine/draft data join
- [x] Mobile responsive profile modal
- [x] Deployed to Render

### Phase 11 — Positional Heat Maps + Breakout Detection
- [x] Heat Map tab in chart panel: canvas-rendered positional percentile grid (red→yellow→green)
- [x] 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency), configurable top 15/20/30
- [x] Position selector (QB/RB/WR/TE), rotated stat headers, player names + team badges
- [x] Heat map PNG export: "Export PNG" button, downloads razzle-heatmap-{position}.png with watermark
- [x] Breakout detection: backend _enrich_with_breakout() computes 50%+ YoY PPR increase
- [x] BRK% column in screener (Dynasty preset), green pill badges for breakout players
- [x] Breakout badge in player profile modal (sticker aesthetic: rotated, green, chunky border)
- [x] Deployed to Render

### Phase 12 — Prospect Cards + Athletic Percentiles
- [x] Prospect profile cards: click prospect name → rich modal with blue accent header, PROSPECT badge, school + draft info
- [x] Backend: /api/prospect-profile endpoint with position-group percentile computation for combine metrics
- [x] Athletic percentile bars: horizontal bars colored by percentile (red→orange→yellow→teal→green), inverted for time metrics
- [x] Prospect combine spider chart: canvas-rendered radar chart, 6 axes for combine metrics as percentiles, blue fill
- [x] Measurables bar: height, weight, draft round/pick, team
- [x] NFL career stats section: conditional on having NFL data (games, yards, TDs, All-Pro, Pro Bowls)
- [x] Export PNG with Razzle watermark
- [x] Mobile responsive prospect profile (responsive metric grid)
- [x] Deployed to Render

---

## Blockers

_None currently._

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-08 | Name: Razzle | One word, football DNA (razzle-dazzle), domain available, comic-strip energy |
| 2026-03-08 | Domain: razzle.lol | Cheap, memorable, fits playful brand |
| 2026-03-08 | Orange → terracotta #d97757 | Claude-esque warmth, matches tiger mascot |
| 2026-03-08 | Fresh repo, not refactor | Every line intentional, no legacy baggage |
| 2026-03-08 | Render for hosting | Already known, free tier works, zero learning curve |
| 2026-03-08 | Garfield/Luckiest Guy font | Comic-strip chunky, stands out from every AI dashboard |
| 2026-03-08 | Agents will be NFL team animals | User picks teams they like, TBD |
| 2026-03-08 | Two-table data model | player_week_stats (fixed columns) + player_week_metrics (dynamic key-value) — proven pattern from FDL |
| 2026-03-08 | Skip half_ppr in nflverse | nflverse CSVs only have ppr and standard — half_ppr computed later if needed |
| 2026-03-08 | Single FastAPI serves frontend + API | No separate static site — simpler deploy, one Render service |
| 2026-03-08 | Defer NCAA toggle to Phase 1b/2 | Need college_adapter.py first, core NFL screener is the priority |
| 2026-03-08 | Defer week-level breakdowns | Season aggregates first, per-week view adds complexity — ship the table |
| 2026-03-08 | 5 column presets over custom | PPR/Passing/Rushing/Receiving/Dynasty covers 95% of use cases |
| 2026-03-08 | Canvas API over Chart.js | Zero dependencies, full control, smaller bundle, charts are simple enough |
| 2026-03-08 | Max 5 players for compare | Keeps radar readable, prevents API abuse |
| 2026-03-08 | Formulas as weighted composites | Simple percentage weights × stat values — covers dynasty values, efficiency scores, custom rankings |
| 2026-03-08 | Waitlist in localStorage | No backend auth yet, email capture is just localStorage. Real backend waitlist post-draft |
| 2026-03-08 | Sleeper players API cached client-side | The /players/nfl endpoint is 25MB+ — should be cached/proxied server-side in production |
| 2026-03-08 | 3 War Room demo cards | Razzle/Scout/Diplomat covers the breadth of agent types without over-promising |
| 2026-03-08 | nflverse combine + draft picks over CFBD API | Free CSVs, no API key needed, same adapter pattern as NFL data. Combine metrics + draft capital are the highest-value data for draft week dynasty users |
| 2026-03-08 | "Prospects" not "College" | Available data is combine/draft focused, not full college production stats. "Prospects" better describes what we have and what dynasty users want during draft week |
| 2026-03-08 | Blue accent for prospect mode | Per design guide — NFL/NCAA toggle uses blue (#5b7fff) for college/prospect content. Visual differentiation makes the toggle obvious |
| 2026-03-08 | Filters hidden in prospect mode | Prospect dataset is small (~300/year), position + sort + search covers all use cases. Will add filters if needed later |
| 2026-03-08 | 33 demo briefings not 50-60 | North Star says 50-60, but 33 across 6 agent types with 3 shown per visit = 5456 unique combinations. Diminishing returns past ~30. Can add more later |
| 2026-03-08 | SVG favicon over PNG | Zero-dependency, scales to any size, tiger emoji matches brand, no design tool needed |
| 2026-03-08 | Pre-launch polish before Phase 5 | All code phases done. Polish (mobile, demo rotation, design audit) maximizes Reddit launch impact |
| 2026-03-08 | Multi-season data (2020-2024) | Single-season severely limits dynasty analysis. 5 seasons enables career arcs, breakout detection, year-over-year trends. Essential for Reddit draft-week content |
| 2026-03-08 | Career view as first dropdown option | Dynasty managers think in careers, not single seasons. Career aggregates are the default mental model for dynasty analysis |
| 2026-03-08 | Advanced metrics from player_week_metrics | target_share, WOPR, RACR, EPA are Reddit power user stats. Enriched via secondary query (not JOIN) to keep main query fast |
| 2026-03-08 | Python re-sort for derived metrics | Derived/rate metrics can't be sorted in SQL since they're computed post-query. Fetch extra rows, re-sort in Python. Trade-off: slightly less precise pagination but much simpler architecture |
| 2026-03-09 | Player profiles as Phase 10 | All 9 roadmap phases complete. Player profile modals are the most impactful next feature for Reddit screenshots — clicking a player name shows a rich detail view. CFBD college data deferred (needs API key). Profile export creates another shareable asset. |
| 2026-03-09 | Position-specific profile layouts | QB/RB/WR/TE each get different headline stats and season table columns. QBs see pass yards/TDs/CMP%, RBs see rush/rec, WR/TE see targets/receptions/YAC. More useful than one-size-fits-all. |
| 2026-03-09 | Heat maps + breakout detection as Phase 11 | Heat maps fill the last major visualization gap from the North Star. Positional percentile heat maps are extremely screenshottable for Reddit — dynasty managers love position tier grids. Breakout detection (50%+ YoY PPR) leverages multi-season data for a uniquely useful dynasty signal. Both create new shareable content types. |
| 2026-03-09 | Prospect cards as Phase 12 | Clickable prospect profiles with athletic percentile bars and spider charts are THE draft week content for r/DynastyFF and r/NFL_Draft. Combine percentiles within position group give instant context (is 4.50 fast for a WR?). Spider charts create a unique visual fingerprint per prospect — highly screenshottable. Uses existing nflverse combine data, no CFBD API key needed. |
| 2026-03-09 | Athletic comps + tier view as Phase 13 | "Who is this prospect's NFL athletic comp?" is THE question dynasty managers ask during draft week. Euclidean distance on percentile-normalized combine metrics finds historical matches. Tier view groups a whole position's draft class by athletic profile — creates screenshottable tier lists for Reddit. Prospect comparison mode enables side-by-side analysis. All three features use existing nflverse data, creating maximum content from available data. |
| 2026-03-09 | Composite prospect scoring as Phase 14 | Razzle Prospect Score (RPS) creates a single "how good is this prospect" number combining athletic percentile (60%), draft capital (30%), and size (10%). Big Board ranked list is THE draft-week content for dynasty Reddit — "Razzle's 2025 WR Big Board" with tier bands is an instant screenshottable PNG. CFBD college production stats blocked (no API key), so RPS maximizes value from available combine+draft data. |
| 2026-03-09 | Unified prospect report cards as Phase 15 | Prospect profile cards were missing RPS score and comp-based projections — data was spread across Big Board and profile. Consolidating everything (RPS + tier badge + percentile bars + spider chart + comps + projections) into one view creates THE definitive shareable prospect card for Reddit. One click, one card, one PNG. Client-side RPS computation avoids extra API call. Comp-based projections use weighted similarity averages of comp NFL careers. |
| 2026-03-09 | Draft class analytics as Phase 16 | Cross-year class comparison creates a new category of screenshottable content: "Is the 2025 WR class better than 2024?" posts get massive engagement on r/DynastyFF during draft season. Reuses existing RPS computation across all draft years (2020-2026). Class grades (A/B/C/D) based on avg RPS + elite/premium ratio create instant talking points. Bar chart + class cards = two shareable formats from one feature. No new external dependencies. |
| 2026-03-09 | College production stats as Phase 17 | cfbfastR play-level CSV aggregation unlocks "which WR dominated in college?" content for Reddit. sportsdataverse GitHub CSVs = free, no API key, same pattern as nflverse. Three-way universe toggle (NFL/Prospects/College) keeps the Lab as the single power tool. College profiles cross-reference combine/draft data for prospect pipeline analysis. |
| 2026-03-09 | Dynasty Value Score as Phase 19 | Dynasty rankings are THE most shared content on r/DynastyFF. Every tool has them, Razzle didn't. DVS = age-adjusted PPR composite with position-specific curves (QBs age slowly, RBs drop fast). nflverse roster CSVs provide free age data (birth_date). "Dynasty Rankings" preset creates instant shareable content: "Razzle's Top 200 Dynasty Rankings." Simple formula, huge screenshotability. |
