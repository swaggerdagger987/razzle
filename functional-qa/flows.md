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
| 1 | Landing -> Lab | CTA click, initial data load, screener populates with real player data | RE-AUDIT SESSION 35 — PASS. FUNC-029 FIXED: snap_share thresholds corrected to 50/65/40 (percentages). Prod verified: RB snap_share>=65 returns 9 players (McCaffrey 83.1%, Gibbs 67.0%). Smart filter URL handler still not deployed to prod (FUNC-036). |
| 2 | Screener: Position filter | Filter QB/RB/WR/TE individually. Count matches. Remove filter. Table resets? | RE-AUDIT SESSION 48 — FUNC-047 FIXED on prod. Goff=DET, Barkley=PHI, McCaffrey=SF all correct. POST screener teams=["DET"] returns 5 DET players (Gibbs, Montgomery). Adapter 406e6a3 adds per-row team UPDATE + bulk refresh from latest game data. Position filter continues to pass. |
| 3 | Screener: Multi-filter | Chain 3 filters (pos + team + min stat). Results are the correct intersection? | RE-AUDIT SESSION 48 — FUNC-047 fixed. Team filter now returns correct players on prod. Multi-filter with team should be reliable post-deploy. |
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | RE-AUDIT SESSION 41 — FUNC-042 CODE FIX VERIFIED. Count query moved before limit/offset params (correct binding). min(total,5000) replaces hardcoded 500/2000. Career WR 728 now fully fetched. POST endpoint also fixed. Prod GET still broken (target_share returns PPR order). POST screener works correctly on prod for single-season (28 RBs sorted correctly). Not deployed. |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | RE-AUDIT SESSION 24 — PROD PASS. Ship Loop fix deployed: re.sub(r"[^a-z0-9]", "") strips apostrophes/hyphens/periods before search_name LIKE. Prod: quick_search("Ja'Marr")=Chase, quick_search("Amon-Ra")=St.Brown, quick_search("D'Andre")=Swift. All 3 endpoints (quick_search, fetch_players, screener_query) strip correctly. |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | RE-AUDIT SESSION 13 — PASS. 2025 (CMC 416.6) vs 2024 (Lamar 430.4) confirmed different. Career mode verified (Wilson 2890.14/157GP). |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | RE-AUDIT SESSION 34 — CODE FIX VERIFIED. core.py:497-500 returns early when week>0 (skips PBP enrichment). FUNC-031: PBP table has 0 rows locally so leak is moot. Core stats (passing_yards, rushing_yards) filter correctly by week. Fix awaits deploy (FUNC-030). |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | RE-AUDIT SESSION 28 — PASS. Ship Loop table guards verified (college.py _has_table for cfb_player_season_stats, prospects.py for combine_data). Prod: College QBs 2024=633 (Dart/McCord/Ward correct), College WRs=1844, season switch 2023 correct (Daniels LSU 3630yd). Prospects 2025=5 (Ward/Hunter/Carter). College profile (Dart): 4 seasons, combine+draft data. |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | DONE — PASS. 87 columns, 8 presets, modal opens on prod. Browser-verified. |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | RE-AUDIT SESSION 47 — FUNC-045 FIXED. Ship Loop 4ae7f0e replaced inline onclick with data-pid + addEventListener delegated handler (lab.js:2278-2284). .col-star excluded from row-highlight handler (line 2264). 25 star cells render with data-pid attributes. Apostrophe names (Ja'Marr, D'Andre) safely stored via escapeAttr in data attributes. Pin functionality OK. |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | DONE — API PASS, UI now unblocked (FUNC-001 fixed). |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | DONE — PASS. Code+UI verified. 24 call sites, all state serialized. |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | RE-AUDIT SESSION 51 — PASS (data loads correctly). NEW FUNC-057 (P2): career.html:965 + percentiles.html:608 use old `d.players` pattern for initial URL load (API returns array). Search input stays empty on ?player= URLs. Ship Loop fixed autocomplete (first call) but missed initial-load (second call). Data renders fine, cosmetic only. |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | RE-AUDIT SESSION 47 — FUNC-046 FIXED. Ship Loop e0c4a3c added round(..., 1) to career sum in players.py:743. McCaffrey fantasy_points_std now 1889.3 (was 1889.2999999999997). Chase fantasy_points_ppr now 1526.3 (was 1526.3000000000002). Allen 2825.9 clean. 0 IEEE 754 artifacts in 3 tested profiles. |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar 2024 game log=17 weeks (1-18 only), 17 GP. |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | RE-AUDIT SESSION 51 — FUNC-053 FIXED. Ship Loop 35e3a3a changed data-panel="compare" → "career-compare" + added to FREE_PANELS. Browser verified: panel loads with 3 player slots, autocomplete works. Standalone /compare/{id1}/{id2} also works (session 39). |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | RE-AUDIT SESSION 26 — PASS. Session 25 radar chart fix verified: min/max range normalization supports negative EPA (charts.js:173-182, 230-231). Normalize: (raw - min) / (max - min), clamped [0,1]. Charts position-colored, theme-aware, DPI-scaled. |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | RE-AUDIT SESSION 19 — PASS. 0 JS errors, 23 rows, 69 sidebar items. 5 broken NFL headshot images (FUNC-004). No regressions from Ship Loop changes. |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | RE-AUDIT SESSION 40 — CODE FIX VERIFIED. Ship Loop widened log compression denominator (30→50) in core.py:857. Top 4 spread improved 0.5→1.8 (Chase 95.8, Gibbs 95.2, Bijan 94.7, Bowers 94.0). TE overvaluation reduced: 2 TEs in top 30 (was 5). 30 players in 90-100, 16 in 85-90, 26 in 80-85, 28 in 70-80. No values >100 or <0. P2 residual: all top-30 still tier 1. Fix not deployed to prod. |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | DONE — PASS |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | DONE — PASS (functional), P2 S-tier bloated (76 players, FUNC-003) |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | RE-AUDIT SESSION 45 — FUNC-044 FIXED. Ship Loop a4dd9b1 replaced inline onclick with data-name + addEventListener for aging curves legend buttons (lab.js:9692-9704). Prospect links also fixed (lab.js:1762, delegated click handler at 2273). Code verified clean. Chart rendering fine. P2: WR/TE survivorship bias remains. |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | DONE — PASS. Code+API verified. 3 slots, autocomplete, PPG chart, career summary, PNG export. FUNC-001/006 now fixed. |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | RE-AUDIT SESSION 20 — PASS. FUNC-016 FIXED in code: inline onclick replaced with data-pid + addEventListener pattern (matching matchups.html fix). Pending deploy. |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | RE-AUDIT SESSION 13 — PASS. 2025 data: weeks 1-18 only (FUNC-012 holding). Allen 16GP, Stafford 17GP. |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | RE-AUDIT SESSION 27 — PASS. Week 1 2025: Allen 38.8 PPR #1 (correct). RB filter: all 25 RBs (Henry #1, 29.2). Week 10: different data (JTaylor 49.6 #1). P2 retracted: code uses `p.field != null` ternary, not `|| '-'` — 0 displays correctly as 0. |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | RE-AUDIT SESSION 17 — PASS. Post Session 18 XSS fix (data-pid + addEventListener replaces inline onclick). 32 teams in API. Pro-locked panel correctly gated. Font-display fix applied to table headers. 0 JS errors. |
| 28 | Stacks | QB-WR/TE stacks shown? Correlation data makes sense? | RE-AUDIT SESSION 40 — CODE FIX VERIFIED. Ship Loop raised min_games default from 5 to 8 (tools.py:2049), exposed as API param (server.py:3209), cache key includes min_games. Prod still uses old code (Flacco+Whiteheart r=0.995 in 6G still showing). Fix not deployed. |
| 29 | Breakouts | Candidates shown with data? Breakout criteria visible and reasonable? | RE-AUDIT SESSION 45 — FUNC-043 FIXED. Ship Loop 2b8af7d added round(..., 1) to rbs_score (analytics.py:756). Verified: 0/50 RB and 0/50 WR breakout candidates have IEEE 754 artifacts. Also fixed div-by-zero in usage trends (analytics.py:1849). Data sensible. |
| 30 | Waivers | Waiver targets shown? FAAB values if applicable? Sorted by priority? | DONE — PASS (30 targets, delta math correct, 4-week window). P2: no ownership data, so "waivers" are just trending-up players (Bryce Young #1 = rostered everywhere). No FAAB values. |
| 31 | Streaks | Hot/cold streaks identified? Based on recent weeks, not season aggregate? | RE-AUDIT SESSION 44 — PASS. Ship Loop null guard on bar chart scores (scores[j] || 0) verified. Prod API: 0 null scores in hot/cold streaks. 0 JS errors. Page Pro-gated on prod. |

## Group 5: Advanced Analytics Panels (the nerd stuff — has to be right)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 32 | Target Share / Air Yards | Values are percentages that sum correctly per team? WOPR calculated right? | RE-AUDIT SESSION 49 — FUNC-050 FIXED. Ship Loop d697403 corrected: `air_yard_pct`→`air_yards_share` (with *100 display, line 5431), `games_played`→`games` (lines 5310, 5436). Code verified. Panel Pro-gated so browser verification deferred. API returns correct data (air_yards_share=0.249 for Thornton). WOPR/RACR/aDOT fields unchanged and correct. |
| 33 | Snap Efficiency | Snap % shown? Fantasy points per snap derived correctly? | DONE — PASS (calcs correct), P2 no min snap threshold |
| 34 | Red Zone | RZ targets/carries shown? RZ stats don't include non-RZ plays? | RE-AUDIT SESSION 37 — PASS. Jacobs #1 (24 GL carries, 11 GL TDs, 44% GL TD rate). td_dependent shows low-PPG scrubs (Pickett 5PPG) — P2 design choice, no min PPG filter on TD-dependent section. |
| 35 | Opportunity Share | Opportunity = targets + carries? Per-team shares sum to ~100%? | RE-AUDIT SESSION 48 — FUNC-047 FIXED on prod. Team data now correct (McCaffrey=SF, Goff=DET). Opportunity share calculations should be accurate post-deploy. Per-team sums need re-verification on next prod deploy. |
| 36 | Efficiency metrics | YPC, YPR, YPT calculated correctly from raw stats? Not showing NaN/Infinity for 0 attempts? | RE-AUDIT SESSION 42 — PASS. Ship Loop season_type='regular' filter in core.py:345 (_enrich_with_rate_metrics) verified — all screener rate metrics (target_share, snap_share, WOPR, RACR, EPA, CPOE, DAKOTA) now filtered to regular season only. Prod still shows IEEE 754 (FUNC-040) and GET sort bug (FUNC-042). Not deployed. |
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | RE-AUDIT SESSION 51 — FUNC-052 FIXED (lab-panels.js field names corrected: positive_regression, negative_regression, pos_avg_td_rates, td_diff). Pro-gated, code verified. FUNC-055 STILL OPEN: standalone regression.html uses wrong fields (regression_up/regression_down/pos_avg_rates/regression_delta) — redirects to Lab panel so low real impact. FUNC-056 STILL OPEN: pace tracker lab panel uses p.projections/s.milestone vs API p.milestones/s.target — progress bars empty. |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | RE-AUDIT SESSION 37 — CODE FIX VERIFIED. Ship Loop added ppg>=5 threshold (tools.py:1730) and ppg>=8 for clean producers. Running server uses old code (no filter). Covered by FUNC-036. P2: no gt_ppg/clean_ppg split remains. |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | RE-AUDIT SESSION 37 — PASS. API returns positive_script (avg_diff>0) + negative_script (avg_diff<0). Lamar 25.3 PPG (positive, avg_diff=1.4). Classifies by team avg score differential, not per-player splits. Data correct. GT% present. |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | DONE — PASS (DTI=geometric mean of rush+rec yd/g, all 3 verified exact) |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | RE-AUDIT SESSION 27 — PASS. Drake Maye CoV=0.26 StdDev=5.39 PPG=20.7 Grade=A+ (most consistent QB 2025). Data and grades sensible. |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | RE-AUDIT SESSION 44 — PASS. Ship Loop null guards verified: (p.flags || []) and escapeHtml(null) guard. Prod API: 0 null flags, all 50 players have list. McCaffrey workload=106, snap_pct=83.1, flags=['bell cow']. 0 JS errors. |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | RE-AUDIT SESSION 40 — CODE FIX VERIFIED. Ship Loop added Tier column with color-coded badges (lab-panels.js:915,942). vorpTier() computes from VORP value (>=6 elite, >=3 starter, >=1 flex, >=0 fringe, else replacement). CSS for .vorp-tier-badge with 5 color tiers (lab-panels.css:717-732). Sort on vorp_tier correctly falls back to vorp numeric sort (lab-panels.js:887). P2 fixed. Not deployed to prod. |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | RE-AUDIT SESSION 34 — PASS. Prod WR scoring verified: Chase PPR=403, HPPR=339.5 (calc=403-0.5*127=339.5), STD=276 (calc=403-127=276). All 5 top WRs exact. QB PPR=HPPR=STD correct (0 receptions). Half-PPR backfill (Phase F-1) working across all seasons. |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | RE-AUDIT SESSION 28 — PASS. Ship Loop _has_table guards for combine_data verified across 8 prospect functions. Prod: 2026 QB prospects=16, Green #1 RPS=72.8. 2025 prospects correct (Ward/Hunter/Carter). No regressions. |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | RE-AUDIT SESSION 50 — PASS. Ship Loop Session 32 added d.summary||{} and d.players||[] null guards (draftclass.html:461,508). API returns proper data: 2024 class=77 players, summary has 7 keys. 0 JS errors. Null guards are defensive safety nets, not masking field mismatches. |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | SKIP — /api/prospect-profiles returns 404. No dedicated endpoint. Prospect data available via /api/prospect-scores (Big Board, flow 45). |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | SKIP — /api/mock-draft returns 404. Not implemented. |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | SKIP — /api/prospect-radar returns 404. Not implemented. |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | SKIP — /api/custom-scoring returns 404. Not implemented as API endpoint. May be frontend-only. UI blocked by FUNC-001. |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | RE-AUDIT SESSION 24 — CODE PASS. Session 24 fix: 7 additional fields now persisted in save/load cycle: week, teams, minGP, tierBreaks, groupHeaders, summaryBar, tagFilter. Save (lab.js:4144-4150) and load (lab.js:4202-4208) both handle all fields with undefined guards. Max 20 enforced. Cloud sync for Pro. Delete with confirm. |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | RE-AUDIT SESSION 16 — PASS. B-2 fixes verified: modal opens on prod, stat selector populated, name+weight inputs work. XSS escape on delete button (B-2 fix). Init ordering fix (loadFormulas before loadStateFromURL) prevents formula column loss on URL restore. 0 JS errors. |
| 53 | Formula Store | Browse formulas. Install one. It works? Shows in column picker? | RE-AUDIT SESSION 43 — PASS. Ship Loop c613fc6 XSS fix verified: search input value="" now uses escapeAttr (escapes ") instead of escapeHtml. 10 seed formulas, no special chars in names. No regressions from fix. |
| 54 | Export PNG | Exports an image? Contains visible data? Watermark present? | RE-AUDIT SESSION 30 — PASS. CEO review: watermark now includes shareable URL below domain name. lab.js:92-104: "razzle.lol" at 28px Caveat, then current URL (truncated to 60 chars) at 16px Space Mono. Both right-aligned, themed opacity. Panel exports (html2canvas) also have watermark. 0 JS errors. |
| 55 | Export CSV | Downloads a CSV? Columns match what's on screen? Data correct? | DONE — PASS. Pro-gated with upgrade toast+link. Includes branding header, Player/POS/Team + all visible columns, csvEscape for special chars, BOM prefix for Excel compat. Descriptive filename (position-season-date). URL.revokeObjectURL cleanup. Toast with row count. Also available in Share modal. 0 JS errors. |
| 56 | Share URL | Copy URL. Open fresh. Exact same view restored? | DONE — Code+UI PASS (flow 12). FUNC-001 fixed, URL state verified. |

## Group 8: Navigation & Platform (the shell around the data)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 57 | Sidebar navigation | Every sidebar item loads its panel? No dead links? Category headers correct? | RE-AUDIT SESSION 51 — FUNC-053 FIXED (compare → career-compare), FUNC-054 FIXED (mockdraft + proradar removed from sidebar). Browser verified: 0 orphan panel links. All sidebar items point to valid panels. |
| 58 | Command palette (Ctrl+K) | Opens? Finds panels by name? Finds players? Selection navigates correctly? | DONE — PASS. Opens via nav button, search input focused, "Search players... (Ctrl+K)" placeholder. Browser-verified on prod. |
| 59 | Dark mode | Every element switches? Data readable in dark? Charts visible? No white flashes? | RE-AUDIT SESSION 27 — PASS. Ship Loop Session 25-26 dark mode fixes verified: heat colors (isDark branch, higher opacity), 29 panel hover tints (0.18 opacity), modal overlays (rgba(0,0,0,...)). Lab and landing page screenshots clean. Espresso palette, readable text, no white flashes. |
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | RE-AUDIT SESSION 23 — PASS. Registration button UX fix re-verified in code: origText captured at start, restored on all 4 validation paths (password mismatch, length, letter, number) + finally block. Login button has matching loading state ("signing in..."). No regressions from Ship Loop merge. |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | RE-AUDIT SESSION 44 — PASS. Ship Loop billing.py trial_used fix verified: MAX(trial_used, ?) prevents resetting from 1→0 on non-trial purchases. trial_used_val=1 only for actual trials. INSERT also uses dynamic value. Correct behavior preserved for both new and existing subscriptions. |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar GP=17, Burrow GP=17, PPG=25.3. Correct regular-season values. |

## Group 9: Bureau & Situation Room (the paid tier)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 63 | Bureau: League Intel | Sleeper connect flow? Roster loads? Insights generated from real league data? | RE-AUDIT SESSION 40 — FUNC-041 CODE FIX VERIFIED. Ship Loop added RookieSZN and BuyLowSellHigh demo managers (league-intel.html:7351-7352), now 12 managers matching "12-team" label. Records from 2-11 to 3-10 (sensible). Cache TTL fix in lab.js (5-min TTL, _QUERY_CACHE_TTL=300000). Not deployed to prod. |
| 64 | Situation Room | Canvas loads? Agents rendered? Interaction works? | RE-AUDIT SESSION 45 — PASS. Ship Loop f2544e1 fixed bio card inline onclick: data-agent-name + addEventListener replaces escapeAttr-in-onclick. escapeHtml on agent names. Previous fixes (filter resilience, LLM timeout) still in place. No regressions. |

## Group 10: Edge Cases (the stuff that separates demos from products)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 65 | Empty states | No data, no leagues, new user. Every panel handles gracefully? | RE-AUDIT SESSION 30 — PASS. CEO review: empty states and error messages rewritten with Razzle personality. RAZZLE_ERRORS: "fumbled the data fetch", "film room went dark", "something went sideways". RAZZLE_EMPTY: "clean pocket, no receivers open", "the scouting report came back blank". RAZZLE_LOADING: 15 variants ("pulling film...", "analyzing target shares..."). razzleError()/razzleEmpty()/razzleLoading() randomize selection. |
| 66 | Zero vs null | Players with 0 stats vs players with no data. Displayed differently? | DONE — PASS. Negative rushing yards displayed correctly (-10.0). API returns numeric 0 vs null cleanly. |
| 67 | Apostrophes & special chars | Amon-Ra St. Brown, D'Andre Swift, Ja'Marr Chase. Search/display handles? | RE-AUDIT SESSION 24 — PROD PASS. Ship Loop fix: quick_search_players now strips non-alphanumeric chars (re.sub(r"[^a-z0-9]", "")) before matching search_name column. Prod verified: Ja'Marr→Chase, Amon-Ra→St.Brown, D'Andre→Swift. All search endpoints (quick_search, fetch_players, screener_query) consistent. |
| 68 | Rapid interactions | Spam filter changes, double-click buttons, fast panel switching. Stable? | DONE — PASS. Rapid search swaps (mahomes→clear→allen→clear→chase) with 300ms intervals — final query returns correct 3 results. No race conditions. |
| 69 | Stale state | Apply filters, leave tab 10 min, come back. Still works? No expired tokens? | RE-AUDIT SESSION 40 — PASS. P2 FIXED: Frontend query cache now has 5-min TTL (_QUERY_CACHE_TTL=300000 in lab.js:1205). _queryCacheGet() checks staleness and evicts expired entries. Backend cache 2-5min. JWT 7-day. AbortController race prevention. No remaining stale state issues. Fix not deployed to prod. |
| 70 | Cross-panel state | Set season in screener, switch to trade values panel. Same season? Or reset? | DONE — PASS. Rankings→TradeValues→Screener navigation returns correctly with 25 rows, 610 players. No state loss. |

## Group 11: New Features (Ship Loop additions post-build)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 71 | FAAB Strategy panel | Loads? Data correct? Math adds up? Design compliant? | DONE SESSION 36 — PASS. Hardcoded data (no API), weekly spend sums to 100%, position spend sums to 100%. XSS-escaped, 2px borders, proper CSS vars. Pro-locked. Not deployed to prod (FUNC-036). |
| 72 | Agent Presence Layer | Peek fires? Watermark renders? Nudges show for Elite? Config correct? | RE-AUDIT SESSION 38 — PASS. FUNC-038 fixed (border 2px, line 159). FUNC-039 fixed (keyframes IIFE injection, lines 117-123, dedup guard). XSS hardening added (escapeHtml fallback, safeColor regex, javascript: check). agent-config.js panel names corrected: all 67 panels match lab.html sidebar IDs. PANEL_TO_AGENT reverse lookup correct. Razzle fallback for unassigned panels. SVGs still 404 on prod (deployment gap). |
| 73 | Weekly Briefing | Generates? Saves to backend? History loads? Elite-gated? | DONE SESSION 36 — PASS. generateWeeklyBriefing() fills scenario → runs agents → saves via /api/briefings/save (Elite-gated). loadLatestBriefing() fetches + renders. History: last 5 briefings, click to load. All XSS-escaped (escapeHtml, safeParse). Error states with personality text. Backend: 4 endpoints, all require_plan("elite"). Not deployed to prod (FUNC-036). |
| 74 | Prompts page | Loads? 15 prompts? Filters work? Copy works? Prefill to SitRoom works? | RE-AUDIT SESSION 38 — PASS. FUNC-037 fixed: Pricing link added to prompts.html topnav (line 106). Prompts footer link added to agents.html + index.html. P2: 70 other footer pages still missing Prompts footer link (cosmetic inconsistency, not funnel break). 404 on prod (deployment gap). |
