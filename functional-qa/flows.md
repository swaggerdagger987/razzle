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
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | RE-AUDIT SESSION 54 — FUNC-042 STILL ON PROD. GET /api/players sort by target_share returns PPR order. POST screener sorts correctly (JSN 0.357 > Nacua 0.311). Fix not deployed. Lab UI uses POST so users unaffected, but API consumers would see wrong order. |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | RE-AUDIT SESSION 24 — PROD PASS. Ship Loop fix deployed: re.sub(r"[^a-z0-9]", "") strips apostrophes/hyphens/periods before search_name LIKE. Prod: quick_search("Ja'Marr")=Chase, quick_search("Amon-Ra")=St.Brown, quick_search("D'Andre")=Swift. All 3 endpoints (quick_search, fetch_players, screener_query) strip correctly. |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | RE-AUDIT SESSION 13 — PASS. 2025 (CMC 416.6) vs 2024 (Lamar 430.4) confirmed different. Career mode verified (Wilson 2890.14/157GP). |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | RE-AUDIT SESSION 34 — CODE FIX VERIFIED. core.py:497-500 returns early when week>0 (skips PBP enrichment). FUNC-031: PBP table has 0 rows locally so leak is moot. Core stats (passing_yards, rushing_yards) filter correctly by week. Fix awaits deploy (FUNC-030). |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | RE-AUDIT SESSION 56 — PASS. Ship Loop lab.js:1750 escapeAttr→escapeJS fix for college player_id verified. All college IDs safe alphanumeric (00-XXXXXXXX). College QBs return correctly (Lamar, Allen, Burrow top 3). |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | RE-AUDIT SESSION 60 — PASS. 87 columns, 8 presets (PPR/Passing/Rushing/Receiving/Dynasty/Dynasty Rankings/Efficiency/Advanced), presetSelect dropdown visible and working, column picker modal opens with grouped checkboxes. Ship Phases A-G did not regress column picker. 0 JS errors. |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | RE-AUDIT SESSION 55 — PASS. Ship Loop XSS fix: pin onclick now uses escapeJS (was escapeAttr). Browser verified: 1 pin-active after click. 0 JS errors. Player IDs all alphanumeric (no special chars), fix is behavior-preserving. |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | RE-AUDIT SESSION 60 — PASS. Page 1 "1-25 of 610", page 2 "26-50 of 610" with rank #26 first. Prev returns to page 1 exactly. Sort (PPR desc) persists across pages. Position breakdowns change per page (QB:11/RB:8/WR:5/TE:1 → QB:8/RB:8/WR:9). 0 JS errors. |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | DONE — PASS. Code+UI verified. 24 call sites, all state serialized. |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | RE-AUDIT SESSION 58 — PASS. Ship Loop player.js null guards: (_profileData.player||{}).full_name in compare search, compareSearchResults null check before innerHTML clear. Both defensive — normal flow unaffected. Browser: McCaffrey profile opens from Lab click, career stats/season log/dynasty trend all render. 0 JS errors. |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | RE-AUDIT SESSION 47 — FUNC-046 FIXED. Ship Loop e0c4a3c added round(..., 1) to career sum in players.py:743. McCaffrey fantasy_points_std now 1889.3 (was 1889.2999999999997). Chase fantasy_points_ppr now 1526.3 (was 1526.3000000000002). Allen 2825.9 clean. 0 IEEE 754 artifacts in 3 tested profiles. |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar 2024 game log=17 weeks (1-18 only), 17 GP. |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | RE-AUDIT SESSION 51 — FUNC-053 FIXED. Ship Loop 35e3a3a changed data-panel="compare" → "career-compare" + added to FREE_PANELS. Browser verified: panel loads with 3 player slots, autocomplete works. Standalone /compare/{id1}/{id2} also works (session 39). |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | RE-AUDIT SESSION 26 — PASS. Session 25 radar chart fix verified: min/max range normalization supports negative EPA (charts.js:173-182, 230-231). Normalize: (raw - min) / (max - min), clamped [0,1]. Charts position-colored, theme-aware, DPI-scaled. |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | RE-AUDIT SESSION 19 — PASS. 0 JS errors, 23 rows, 69 sidebar items. 5 broken NFL headshot images (FUNC-004). No regressions from Ship Loop changes. |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | RE-AUDIT SESSION 55 — PASS with P2 notes. Top 30 all tier 1 (94.0-90.2, 3.8pt spread). 6 TEs in top 30 (McBride #2, Bowers #9, Kraft #11, Pitts #22, Fannin #24, LaPorta #28) — TE scarcity multiplier still aggressive. 19 TEs in top 100 total. Tier distribution: 33 tier-1, 59 tier-2, 8 tier-3 in top 100. Top-30 compression and TE overvaluation are known P2s. |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | RE-AUDIT SESSION 60 — PASS. API: Lamar Jackson (82.9) returns 25 equal (Stroud 82.9, Love 83.0, Burrow 83.2), 15 buy-low (higher value + falling stock), 12 sell-high (lower value + rising stock). Chase (92.5) returns sensible equal targets (Amon-Ra, Bowers, Rice). Buy/sell logic correct. Panel Pro-gated (by design). Standalone tradefinder.html loads, 0 JS errors. 5 broken NFL headshots (known FUNC-004). |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | RE-AUDIT SESSION 54 — PASS. Ship Loop null guard (tier.players || []) verified. 6 tiers, 390 player chips, 0 JS errors. P2 S-tier still bloated (84 players). |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | RE-AUDIT SESSION 62 — PASS. Ship Loop maxPPG null guard verified: `Math.max(...baseline.map(b => b.avg_ppg).filter(v => v != null), 1)` prevents -Infinity on empty data. Local: 0 baseline points (expected, no birth date data). aging.html 5 canvases, 0 JS errors, no NaN/Infinity text. P2: WR/TE survivorship bias remains. |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | DONE — PASS. Code+API verified. 3 slots, autocomplete, PPG chart, career summary, PNG export. FUNC-001/006 now fixed. |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | RE-AUDIT SESSION 20 — PASS. FUNC-016 FIXED in code: inline onclick replaced with data-pid + addEventListener pattern (matching matchups.html fix). Pending deploy. |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | RE-AUDIT SESSION 13 — PASS. 2025 data: weeks 1-18 only (FUNC-012 holding). Allen 16GP, Stafford 17GP. |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | RE-AUDIT SESSION 27 — PASS. Week 1 2025: Allen 38.8 PPR #1 (correct). RB filter: all 25 RBs (Henry #1, 29.2). Week 10: different data (JTaylor 49.6 #1). P2 retracted: code uses `p.field != null` ternary, not `|| '-'` — 0 displays correctly as 0. |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | RE-AUDIT SESSION 17 — PASS. Post Session 18 XSS fix (data-pid + addEventListener replaces inline onclick). 32 teams in API. Pro-locked panel correctly gated. Font-display fix applied to table headers. 0 JS errors. |
| 28 | Stacks | QB-WR/TE stacks shown? Correlation data makes sense? | RE-AUDIT SESSION 59 — PASS. min_games=8 working locally (Mahomes+Rice r=0.859, 8 games). Pearson correlation math verified in tools.py:2069-2076. Prod still old code (min_games=5, Flacco+Whiteheart). Panel Pro-gated, 0 JS errors, 27 rows rendered. P2: low-value stacks dominate top (Jones+AlieCox 1.4 PPG receiver at #3). |
| 29 | Breakouts | Candidates shown with data? Breakout criteria visible and reasonable? | RE-AUDIT SESSION 57 — PASS. Ship Loop import refactor (lab-panels.js available_seasons null guard). Breakouts panel 0 JS errors, season selector safe. |
| 30 | Waivers | Waiver targets shown? FAAB values if applicable? Sorted by priority? | DONE — PASS (30 targets, delta math correct, 4-week window). P2: no ownership data, so "waivers" are just trending-up players (Bryce Young #1 = rostered everywhere). No FAAB values. |
| 31 | Streaks | Hot/cold streaks identified? Based on recent weeks, not season aggregate? | RE-AUDIT SESSION 59 — PASS. 25 hot + 25 cold streaks, local=prod. Lawrence hot (+10.6 PPG, recent=30.5 vs season=19.9). Flacco cold (-8.5 PPG). 0 null scores. 0 JS errors, 27 rows. No regressions from import/ROUND sweeps. |

## Group 5: Advanced Analytics Panels (the nerd stuff — has to be right)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 32 | Target Share / Air Yards | Values are percentages that sum correctly per team? WOPR calculated right? | RE-AUDIT SESSION 49 — FUNC-050 FIXED. Ship Loop d697403 corrected: `air_yard_pct`→`air_yards_share` (with *100 display, line 5431), `games_played`→`games` (lines 5310, 5436). Code verified. Panel Pro-gated so browser verification deferred. API returns correct data (air_yards_share=0.249 for Thornton). WOPR/RACR/aDOT fields unchanged and correct. |
| 33 | Snap Efficiency | Snap % shown? Fantasy points per snap derived correctly? | RE-AUDIT SESSION 60 — PASS. 50 players, 0 nulls, 0 outliers. Nacua pts/snap=0.52 (23.6 PPG / 45.4 snaps/g = 0.52 verified). 25 rows rendered in panel, 0 JS errors. P2 persists: no min snap threshold (Mitchell 7.8 snaps/g at #1 with 0.73 pts/snap, inflated by low volume). |
| 34 | Red Zone | RZ targets/carries shown? RZ stats don't include non-RZ plays? | RE-AUDIT SESSION 59 — PASS. Prod: 30 dominators (Henry 27 GL carries, 10 GL TDs; Taylor 24/9; McCaffrey 20/12). td_dependent math verified: Heyward 65.7% (3TD×6pts / 27.4 total). Local: 0 dominators (PBP empty, known). Code clean: get_db(), ROUND(), null guards. No regressions from sweeps. |
| 35 | Opportunity Share | Opportunity = targets + carries? Per-team shares sum to ~100%? | RE-AUDIT SESSION 57 — PASS. Ship Loop import refactor (defaultdict hoisted). Endpoint 200, McCaffrey 46.8% opp_share, Jeanty 39.4%, Robinson 39.2%. 0 JS errors on panel. |
| 36 | Efficiency metrics | YPC, YPR, YPT calculated correctly from raw stats? Not showing NaN/Infinity for 0 attempts? | RE-AUDIT SESSION 62 — PASS. Ship Loop td_rate null guard verified: `p.td_rate != null ? fmt(p.td_rate, 1) + '%' : '-'` in efficiency.html. QB exclusion confirmed (0 QBs in Volume Kings with fresh server). efficiency.html 23 rows, 0 JS errors, no NaN/undefined text. FUNC-063 grade scale inconsistency still open (6-tier vs 8-tier). |
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | RE-AUDIT SESSION 55 — PASS. FUNC-055/056 fixes re-verified: pace-tracker API returns milestones array with correct structure (label/target/current/projected/on_pace). McCaffrey 1000 rush yd ON PACE confirmed (current=1202 > target=1000). Compare page HTTP 200. Both panels Pro-gated. |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | RE-AUDIT SESSION 59 — PASS. Code verified: ppg>=5 stat padders, ppg>=8 clean producers (lines 1733-1736). Local: 0 results (PBP empty, known). Prod: 40+40 but old code (no ppg filter, known deployment gap — Mullens ppg=-0.0 showing). No regressions from import hoisting sweeps. |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | RE-AUDIT SESSION 37 — PASS. API returns positive_script (avg_diff>0) + negative_script (avg_diff<0). Lamar 25.3 PPG (positive, avg_diff=1.4). Classifies by team avg score differential, not per-player splits. Data correct. GT% present. |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | RE-AUDIT SESSION 60 — PASS. 50 players (48 RB, 2 WR, 0 QB). DTI verified: Robinson sqrt(86.9*48.2)=64.7 vs 64.8 OK, McCaffrey sqrt(70.7*54.4)=62.0 OK, Gibbs sqrt(71.9*36.2)=51.0 OK. All 5 checked within 0.2 tolerance. 25 rows in panel, 0 JS errors. P2: QBs absent (DTI=rush+rec, not pass+rush). |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | RE-AUDIT SESSION 62 — PASS. Ship Loop boom/bust null guards verified: floor_ppg, ceiling_ppg, median_ppg, boom_rate, bust_rate all `|| 0` in drawBoomBustRangeBar and exportBoomBustImage (lab.js). Defensive only — API returns non-null for tested players. Code safe: `|| 0` on float doesn't trigger on 0.0. P2 pre-existing: single-season players (CoV=0.0) dominate Rock Solid. |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | RE-AUDIT SESSION 59 — PASS. Prod: McCaffrey #1 (workload=106, snap_pct=83.1), Taylor #2 (97), Robinson #3 (95). Local: stale teams (McCaffrey=CAR, Barkley=NYG) and null snaps — FUNC-058 adapter fix not applied to local DB. 0 JS errors, 27 rows. No regressions from dashboards.py sweeps. |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | RE-AUDIT SESSION 58 — FUNC-060 FIXED. Ship Loop position-specific PPO thresholds (TE:20 vs old 50). Stock Watch rising TEs: 17/20 now have PPO (was 2/20). 3 remaining nulls legitimate (<20 opps: Sinnott 9G, Hawes 13G, Oliver 12G). Efficiency rankings: 30 TEs in most_efficient, 6 edge-case TEs with 20-30 opps (expected). 0 JS errors. |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | RE-AUDIT SESSION 59 — PASS. McCaffrey hand-verified: STD=1202×0.1+10×6+924×0.1+7×6=314.6✓, PPR=314.6+102=416.6✓, HPPR=(416.6+314.6)/2=365.6✓, PPG=416.6/17=24.5✓, YPC=1202/311=3.9✓. QB PPR=STD (0 recs). 10 WRs + 5 QBs checked, 0 formula errors. ROUND sweep did not break calculations. |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | RE-AUDIT SESSION 62 — PASS. Ship Loop RPS null guard verified: `(p.rps || 0).toFixed(1)` in 4 places (lab.js:8387 + 3 export). API: 319 prospects, 0 null RPS (Green #1 RPS=72.8). prospects.html 319 .bb-card elements, 0 JS errors. Guard is defensive only. |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | RE-AUDIT SESSION 62 — PASS. Ship Loop avg_rps null guard verified: `(cls.avg_rps || 0).toFixed(1)` in 3 places (lab.js chart rendering + export). draftclass.html 5 canvases, 0 JS errors. Guard is defensive only. |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | SKIP — /api/prospect-profiles returns 404. No dedicated endpoint. Prospect data available via /api/prospect-scores (Big Board, flow 45). |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | SKIP — /api/mock-draft returns 404. Not implemented. |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | SKIP — /api/prospect-radar returns 404. Not implemented. |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | SKIP — /api/custom-scoring returns 404. Not implemented as API endpoint. May be frontend-only. UI blocked by FUNC-001. |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | RE-AUDIT SESSION 24 — CODE PASS. Session 24 fix: 7 additional fields now persisted in save/load cycle: week, teams, minGP, tierBreaks, groupHeaders, summaryBar, tagFilter. Save (lab.js:4144-4150) and load (lab.js:4202-4208) both handle all fields with undefined guards. Max 20 enforced. Cloud sync for Pro. Delete with confirm. |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | RE-AUDIT SESSION 57 — PASS. Ship Loop import refactor (4 in-function import json removed from storage.py, already at module level). Formula store listing (10 formulas) + detail (PPR Workhorse: 5 stat_weights dict) both work correctly. 0 JS errors. |
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
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | RE-AUDIT SESSION 58 — PASS. Ship Loop app.js: localStorage operations in apiFetch 401 handler and checkAuth wrapped in try-catch (lines 516, 970, 975). Defensive for quota-exceeded/blocked-storage edge cases. Normal auth flow unaffected. formulas.js: catch handler now logs error message (was silent). 0 JS errors on Lab load. |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | RE-AUDIT SESSION 44 — PASS. Ship Loop billing.py trial_used fix verified: MAX(trial_used, ?) prevents resetting from 1→0 on non-trial purchases. trial_used_val=1 only for actual trials. INSERT also uses dynamic value. Correct behavior preserved for both new and existing subscriptions. |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | RE-AUDIT SESSION 62 — PASS. 15 standalone pages spot-checked post-merge: stocks.html, reportcard.html, awards.html, consistency.html, seasonpace.html, records.html, streaks.html, garbagetime.html, dualthreat.html, opportunity.html, lab.html, index.html, tradevalues.html, rankings.html, leaders.html — ALL 0 JS errors. FUNC-063 grade scale inconsistency still open (ticket exists). |

## Group 9: Bureau & Situation Room (the paid tier)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 63 | Bureau: League Intel | Sleeper connect flow? Roster loads? Insights generated from real league data? | RE-AUDIT SESSION 62 — PASS. Ship Loop Monte Carlo null guards verified: `if (!roster || !roster.players)` in both league-intel.html:6208 (inline fallback) and monte-carlo-worker.js:34 (Web Worker). Guards prevent TypeError when roster entry has no players (empty roster slots). league-intel.html 0 JS errors. playoffs.html `p.weeks || []` guard also verified, 0 JS errors. No regressions. |
| 64 | Situation Room | Canvas loads? Agents rendered? Interaction works? | RE-AUDIT SESSION 52 — PASS. Phase C-6 Bureau→Situation Room bridge verified: prefillScenario stores to localStorage, warroom.js reads on init (line 1727), sets textarea value, removes key, focuses input, shows "pre-loaded from Bureau" status. League context enrichment via razzle_league_context with 7-day staleness check (line 2125). Manager profiles, history depth, and history seasons passed to agent context. 0 JS errors. Previous fixes (bio card delegation, filter resilience, LLM timeout) still in place. |

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
