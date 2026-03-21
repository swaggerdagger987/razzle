# Razzle Functional QA — Flow Checklist

> Each flow is one "experiment." The agent audits flows in order, marks them DONE, and moves on.
> The human can reorder, add, or remove flows at any time. The agent respects the list.

## Status Key
- `PENDING` — not yet audited
- `IN_PROGRESS` — agent is currently auditing
- `DONE` — audited, results logged to results.tsv
- `SKIP` — intentionally skipped (with reason)

---

## Group 1: Core Screener (the money features — test these like your league depends on it)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 1 | Landing -> Lab | CTA click, initial data load, screener populates with real player data | RE-AUDIT SESSION 32 — PARTIAL PASS. FUNC-027 FIXED: smart filter link corrected (breakouts→breakout). FUNC-026 FIXED in Ship Loop local (data.items + full_name), working on running server, not pushed to origin yet. Mini-screener loads 15 players correctly. NEW: FUNC-029 filed — smart filter snap_share thresholds use fraction format (0.5) but data is percentage (50). 3/6 smart filters (breakout, studs, rookies) return 0 results on local dev due to NULL age data — prod has ages and returns 120 breakout candidates. Smart filter URL handler (?sf=) not yet deployed to prod. |
| 2 | Screener: Position filter | Filter QB/RB/WR/TE individually. Count matches. Remove filter. Table resets? | DONE — PASS (all 4 positions clean) |
| 3 | Screener: Multi-filter | Chain 3 filters (pos + team + min stat). Results are the correct intersection? | DONE — PASS (RB+800yd = 27, all correct) |
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | RE-AUDIT SESSION 31 — CODE FIX VERIFIED. Ship Loop added td_rate, fumble_rate, passer_rating, ay_per_att, ppfd, ppfd_per_game, yprr to safe_sorts (players.py:308). Python sort route correct. Awaiting Render deploy. |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | RE-AUDIT SESSION 24 — PROD PASS. Ship Loop fix deployed: re.sub(r"[^a-z0-9]", "") strips apostrophes/hyphens/periods before search_name LIKE. Prod: quick_search("Ja'Marr")=Chase, quick_search("Amon-Ra")=St.Brown, quick_search("D'Andre")=Swift. All 3 endpoints (quick_search, fetch_players, screener_query) strip correctly. |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | RE-AUDIT SESSION 13 — PASS. 2025 (CMC 416.6) vs 2024 (Lamar 430.4) confirmed different. Career mode verified (Wilson 2890.14/157GP). |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | RE-AUDIT SESSION 32 — STILL FAILING ON PROD. Allen Week 1: PPR=38.76 (correct single-week) but scramble=48, gl_car=17 (identical to all-weeks season totals). FUNC-023 code fix correct but NOT deployed to Render. PBP-derived stats still leak season totals into weekly view. |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | RE-AUDIT SESSION 28 — PASS. Ship Loop table guards verified (college.py _has_table for cfb_player_season_stats, prospects.py for combine_data). Prod: College QBs 2024=633 (Dart/McCord/Ward correct), College WRs=1844, season switch 2023 correct (Daniels LSU 3630yd). Prospects 2025=5 (Ward/Hunter/Carter). College profile (Dart): 4 seasons, combine+draft data. |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | DONE — PASS. 87 columns, 8 presets, modal opens on prod. Browser-verified. |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | RE-AUDIT SESSION 26 — PASS. Session 25 fix verified: expand arrow disabled on pinned rows (rowIdx null guard, lab.js:1718). Pin icons (CSS-mask SVG) deployed and functional on prod. |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | DONE — API PASS, UI now unblocked (FUNC-001 fixed). |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | DONE — PASS. Code+UI verified. 24 call sites, all state serialized. |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | RE-AUDIT SESSION 24 — PROD PASS. FUNC-019 RESOLVED: /player/00-0036389 loads with 0 JS errors on prod. Session 24 fixes deployed: URL-encode playerId in fetch (encodeURIComponent), skip-link scrollIntoView (no href="#" with base tag), clipboard fallback (navigator.clipboard + execCommand). All verified on prod. |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | DONE — PASS (Lamar 8 seasons sum exactly matches career totals: GP=124, PPR=2531.04, PassYds=24361) |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar 2024 game log=17 weeks (1-18 only), 17 GP. |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | RE-AUDIT SESSION 26 — PROD PASS. Diff bar normalization fix verified (compare.js:251-253, sum always 100%). Prod: /compare/00-0034796/00-0034857 loads with 0 JS errors, 11 stat rows. |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | RE-AUDIT SESSION 26 — PASS. Session 25 radar chart fix verified: min/max range normalization supports negative EPA (charts.js:173-182, 230-231). Normalize: (raw - min) / (max - min), clamped [0,1]. Charts position-colored, theme-aware, DPI-scaled. |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | RE-AUDIT SESSION 19 — PASS. 0 JS errors, 23 rows, 69 sidebar items. 5 broken NFL headshot images (FUNC-004). No regressions from Ship Loop changes. |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | RE-AUDIT SESSION 20 — PASS. Prod: Chase=95.8, Gibbs=95.0, Robinson=94.7 (sensible top 3). FUNC-015 code fix verified (compute_trade_value unified). NOT DEPLOYED: screener dynasty_value still uses old formula on prod. No regressions from Ship Loop quality passes. |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | DONE — PASS |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | DONE — PASS (functional), P2 S-tier bloated (76 players, FUNC-003) |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | RE-AUDIT SESSION 26 — PASS. Session 25 alpha fix verified: globalAlpha restored to 1.0 after dashed player line (lab.js:9529) and after baseline curve (lab.js:9564). No visual artifacts. P2: WR/TE survivorship bias remains. |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | DONE — PASS. Code+API verified. 3 slots, autocomplete, PPG chart, career summary, PNG export. FUNC-001/006 now fixed. |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | RE-AUDIT SESSION 20 — PASS. FUNC-016 FIXED in code: inline onclick replaced with data-pid + addEventListener pattern (matching matchups.html fix). Pending deploy. |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | RE-AUDIT SESSION 13 — PASS. 2025 data: weeks 1-18 only (FUNC-012 holding). Allen 16GP, Stafford 17GP. |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | RE-AUDIT SESSION 27 — PASS. Week 1 2025: Allen 38.8 PPR #1 (correct). RB filter: all 25 RBs (Henry #1, 29.2). Week 10: different data (JTaylor 49.6 #1). P2 retracted: code uses `p.field != null` ternary, not `|| '-'` — 0 displays correctly as 0. |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | RE-AUDIT SESSION 17 — PASS. Post Session 18 XSS fix (data-pid + addEventListener replaces inline onclick). 32 teams in API. Pro-locked panel correctly gated. Font-display fix applied to table headers. 0 JS errors. |
| 28 | Stacks | QB-WR/TE stacks shown? Correlation data makes sense? | RE-AUDIT SESSION 27 — PASS. 2025 data: 30 stacks, Pearson math correct (division guard den>0). Mahomes+Rice r=0.859 (8G). P2 unchanged: min 5 games too low (Flacco+Whiteheart r=0.995 in 6G), min_games API param silently ignored (hardcoded 5). |
| 29 | Breakouts | Candidates shown with data? Breakout criteria visible and reasonable? | DONE — PASS (50 candidates, RBS scores present, opp/prod gap logic sound). P2: snap_pct=0 due to FUNC-007 |
| 30 | Waivers | Waiver targets shown? FAAB values if applicable? Sorted by priority? | DONE — PASS (30 targets, delta math correct, 4-week window). P2: no ownership data, so "waivers" are just trending-up players (Bryce Young #1 = rostered everywhere). No FAAB values. |
| 31 | Streaks | Hot/cold streaks identified? Based on recent weeks, not season aggregate? | DONE — PASS (25 hot, 25 cold, recent_scores averages exact, football-sensible: Gibbs hot, Fields cold). |

## Group 5: Advanced Analytics Panels (the nerd stuff — has to be right)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 32 | Target Share / Air Yards | Values are percentages that sum correctly per team? WOPR calculated right? | RE-AUDIT SESSION 22 — PASS. WOPR/G fix code verified: AVG(stat_value) is already per-game, old code double-divided by GP. Fix: wopr_per_game = wopr (rounded). Prod still has old code (not deployed). WOPR sort works correctly on prod (JSN 0.867 > St.Brown 0.746 > Nacua 0.709). |
| 33 | Snap Efficiency | Snap % shown? Fantasy points per snap derived correctly? | DONE — PASS (calcs correct), P2 no min snap threshold |
| 34 | Red Zone | RZ targets/carries shown? RZ stats don't include non-RZ plays? | DONE — PASS (calcs correct, annotations good) |
| 35 | Opportunity Share | Opportunity = targets + carries? Per-team shares sum to ~100%? | RE-AUDIT SESSION 22 — PASS. Team shares fix code verified: s.team (historical per-game) replaces p.team (current team). Also fixed in report_cards, season_awards, opportunity_share. Removed fantasy_relevant filter for correct team totals. P2 FUNC-005: dominator rec shares still null on prod (fix pending deploy). |
| 36 | Efficiency metrics | YPC, YPR, YPT calculated correctly from raw stats? Not showing NaN/Infinity for 0 attempts? | RE-AUDIT SESSION 32 — FUNC-028 FIXED IN SHIP LOOP LOCAL (not deployed). Ship Loop added s.attempts to SQL and QB position check in stock_watch, report_cards, season_awards. PROD STILL BROKEN: "Most Efficient" award = Goff/Stafford/Rodgers/Burrow (all QBs). Fix awaiting push+deploy. |
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | RE-AUDIT SESSION 13 — PASS. 2025 data: Stafford +16.5 TD delta (sell), Jefferson -5.0 (buy). Math verified. |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | DONE — PASS (data sound, clean producers sensible). P2: no gt_ppg/clean_ppg split, backup scrubs dominate padders |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | DONE — PASS. API returns positive_script (winning) + negative_script (losing) splits. Barkley 22.2 PPG positive, B.Robinson 20.1 PPG negative — sensible. Position filter, season selector, diff badges, GT% chips, escapeHtml on all data. |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | DONE — PASS (DTI=geometric mean of rush+rec yd/g, all 3 verified exact) |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | RE-AUDIT SESSION 27 — PASS. Drake Maye CoV=0.26 StdDev=5.39 PPG=20.7 Grade=A+ (most consistent QB 2025). Data and grades sensible. |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | DONE — MOSTLY FIXED. FUNC-007 snap backfill deployed: McCaffrey 54.8 snaps/g, Taylor 51.9. 3 edge-case players still at 0. |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | RE-AUDIT SESSION 27 — PASS. VORP=PPG-replacement exact (McCaffrey 12.36=24.51-12.15). Thresholds: QB12=17.47, RB24=12.15, WR36=11.31, TE12=10.58. P2 unchanged: missing tier badges. |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | RE-AUDIT SESSION 22 — PASS. Half-PPR falsy fix (hppr is None, not 'not hppr') and STD fallback (PPR - receptions) verified code-correct. Prod data verified: PPR/Half-PPR/STD all match manual calc with delta=0.0 across top 10 players. |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | RE-AUDIT SESSION 28 — PASS. Ship Loop _has_table guards for combine_data verified across 8 prospect functions. Prod: 2026 QB prospects=16, Green #1 RPS=72.8. 2025 prospects correct (Ward/Hunter/Carter). No regressions. |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | RE-AUDIT SESSION 28 — PASS. Ship Loop _has_table guard for draft_picks verified. Prod: 2024 class=77 players, Bo Nix PPG=18.3/34GP (FUNC-011 fix holding). Daniels 19.59 PPG, Bowers 15.13 PPG — data quality sensible. Available classes: 2025-2020. |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | SKIP — /api/prospect-profiles returns 404. No dedicated endpoint. Prospect data available via /api/prospect-scores (Big Board, flow 45). |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | SKIP — /api/mock-draft returns 404. Not implemented. |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | SKIP — /api/prospect-radar returns 404. Not implemented. |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | SKIP — /api/custom-scoring returns 404. Not implemented as API endpoint. May be frontend-only. UI blocked by FUNC-001. |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | RE-AUDIT SESSION 24 — CODE PASS. Session 24 fix: 7 additional fields now persisted in save/load cycle: week, teams, minGP, tierBreaks, groupHeaders, summaryBar, tagFilter. Save (lab.js:4144-4150) and load (lab.js:4202-4208) both handle all fields with undefined guards. Max 20 enforced. Cloud sync for Pro. Delete with confirm. |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | RE-AUDIT SESSION 16 — PASS. B-2 fixes verified: modal opens on prod, stat selector populated, name+weight inputs work. XSS escape on delete button (B-2 fix). Init ordering fix (loadFormulas before loadStateFromURL) prevents formula column loss on URL restore. 0 JS errors. |
| 53 | Formula Store | Browse formulas. Install one. It works? Shows in column picker? | DONE — PASS. Store opens via Tools dropdown, fetches from /api/formulas/store (10 seed formulas). Cards render with ratings, position tags, descriptions. Search with 300ms debounce, sort (popular/top rated/recent). Install requires Pro (gated). XSS-safe. 0 JS errors. |
| 54 | Export PNG | Exports an image? Contains visible data? Watermark present? | RE-AUDIT SESSION 30 — PASS. CEO review: watermark now includes shareable URL below domain name. lab.js:92-104: "razzle.lol" at 28px Caveat, then current URL (truncated to 60 chars) at 16px Space Mono. Both right-aligned, themed opacity. Panel exports (html2canvas) also have watermark. 0 JS errors. |
| 55 | Export CSV | Downloads a CSV? Columns match what's on screen? Data correct? | DONE — PASS. Pro-gated with upgrade toast+link. Includes branding header, Player/POS/Team + all visible columns, csvEscape for special chars, BOM prefix for Excel compat. Descriptive filename (position-season-date). URL.revokeObjectURL cleanup. Toast with row count. Also available in Share modal. 0 JS errors. |
| 56 | Share URL | Copy URL. Open fresh. Exact same view restored? | DONE — Code+UI PASS (flow 12). FUNC-001 fixed, URL state verified. |

## Group 8: Navigation & Platform (the shell around the data)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 57 | Sidebar navigation | Every sidebar item loads its panel? No dead links? Category headers correct? | RE-AUDIT SESSION 30 — PASS. Start Here section added for new users (5 curated panels: Screener, Rankings, Trade Values, Breakout Finder, Compare). Auto-dismisses after 5 panel visits. localStorage-based. 0 JS errors. Nav labels updated across all 70+ pages (Bureau→League Intel, Situation Room→AI Agents). |
| 58 | Command palette (Ctrl+K) | Opens? Finds panels by name? Finds players? Selection navigates correctly? | DONE — PASS. Opens via nav button, search input focused, "Search players... (Ctrl+K)" placeholder. Browser-verified on prod. |
| 59 | Dark mode | Every element switches? Data readable in dark? Charts visible? No white flashes? | RE-AUDIT SESSION 27 — PASS. Ship Loop Session 25-26 dark mode fixes verified: heat colors (isDark branch, higher opacity), 29 panel hover tints (0.18 opacity), modal overlays (rgba(0,0,0,...)). Lab and landing page screenshots clean. Espresso palette, readable text, no white flashes. |
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | RE-AUDIT SESSION 23 — PASS. Registration button UX fix re-verified in code: origText captured at start, restored on all 4 validation paths (password mismatch, length, letter, number) + finally block. Login button has matching loading state ("signing in..."). No regressions from Ship Loop merge. |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | RE-AUDIT SESSION 30 — PASS. CEO review rewrite: hero "7 days of Pro. On the house." with CTA. Pricing section headline "The Screener is forever free." Free tier has visual weight ("no card, no catch"). Pro highlighted with "the film room upgrade" badge. BYOK explained in plain English: "6 AI agents, 20 queries/day — free API key (~$1-3/mo)" for Pro, "No API key needed — we pay for it" for Elite. 0 JS errors. |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar GP=17, Burrow GP=17, PPG=25.3. Correct regular-season values. |

## Group 9: Bureau & Situation Room (the paid tier)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 63 | Bureau: League Intel | Sleeper connect flow? Roster loads? Insights generated from real league data? | RE-AUDIT SESSION 30 — PASS. CEO review: demo mode added ("See a demo league" button). Demo shows 10 sample managers with championship odds (DynastyKing2024 23.4%, TacoTuesday 18.7%, etc.), "YOU" badge, sample data warning banner, "Exit Demo" button. ESPN/Yahoo waitlist with "Notify me" email capture. Championship odds shown as first visible data after connecting. 0 JS errors. |
| 64 | Situation Room | Canvas loads? Agents rendered? Interaction works? | RE-AUDIT SESSION 30 — PASS. CEO review: agent cards redesigned with personality quotes, expertise tags, "Ask [Name]" buttons. Contextual upsell after free-mode responses (dashed orange box showing what agent WOULD tell you with league context, 5 rotating examples). 6 agents, 0 JS errors, 62 buttons. |

## Group 10: Edge Cases (the stuff that separates demos from products)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 65 | Empty states | No data, no leagues, new user. Every panel handles gracefully? | RE-AUDIT SESSION 30 — PASS. CEO review: empty states and error messages rewritten with Razzle personality. RAZZLE_ERRORS: "fumbled the data fetch", "film room went dark", "something went sideways". RAZZLE_EMPTY: "clean pocket, no receivers open", "the scouting report came back blank". RAZZLE_LOADING: 15 variants ("pulling film...", "analyzing target shares..."). razzleError()/razzleEmpty()/razzleLoading() randomize selection. |
| 66 | Zero vs null | Players with 0 stats vs players with no data. Displayed differently? | DONE — PASS. Negative rushing yards displayed correctly (-10.0). API returns numeric 0 vs null cleanly. |
| 67 | Apostrophes & special chars | Amon-Ra St. Brown, D'Andre Swift, Ja'Marr Chase. Search/display handles? | RE-AUDIT SESSION 24 — PROD PASS. Ship Loop fix: quick_search_players now strips non-alphanumeric chars (re.sub(r"[^a-z0-9]", "")) before matching search_name column. Prod verified: Ja'Marr→Chase, Amon-Ra→St.Brown, D'Andre→Swift. All search endpoints (quick_search, fetch_players, screener_query) consistent. |
| 68 | Rapid interactions | Spam filter changes, double-click buttons, fast panel switching. Stable? | DONE — PASS. Rapid search swaps (mahomes→clear→allen→clear→chase) with 300ms intervals — final query returns correct 3 results. No race conditions. |
| 69 | Stale state | Apply filters, leave tab 10 min, come back. Still works? No expired tokens? | DONE — PASS. Backend cache TTL 2-5min expires cleanly, next request refetches. JWT 7-day expiry (no issue for idle). AbortController prevents race conditions on resume. Error handling preserves previous table data + toast. localStorage state persists across sessions. P2: Frontend query cache (LRU 5 entries) has NO TTL — serves cached data indefinitely until page refresh. Minor for stat data but could serve stale numbers if backend updates during session. |
| 70 | Cross-panel state | Set season in screener, switch to trade values panel. Same season? Or reset? | DONE — PASS. Rankings→TradeValues→Screener navigation returns correctly with 25 rows, 610 players. No state loss. |
