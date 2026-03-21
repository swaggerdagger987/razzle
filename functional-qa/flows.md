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
| 1 | Landing -> Lab | CTA click, initial data load, screener populates with real player data | RE-AUDIT SESSION 20 — PASS. Prod: 0 JS errors, 25 rows, 69 sidebar items. FUNC-015 code fix verified (compute_trade_value unified). NOT YET DEPLOYED: prod Nacua=75.2 (old), Chase=94.8 vs trade_value=95.8. Weekly filter works (screener/query). All Ship Loop crash guards, dark mode canvas, thread-safe cache verified. |
| 2 | Screener: Position filter | Filter QB/RB/WR/TE individually. Count matches. Remove filter. Table resets? | DONE — PASS (all 4 positions clean) |
| 3 | Screener: Multi-filter | Chain 3 filters (pos + team + min stat). Results are the correct intersection? | DONE — PASS (RB+800yd = 27, all correct) |
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | DONE — PASS (desc+asc both correct) |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | DONE — PASS. FUNC-002 FIXED on prod. Amon-Ra=1 result, Ja'Marr=1 result, D'Andre=1 result. Browser-verified. |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | RE-AUDIT SESSION 13 — PASS. 2025 (CMC 416.6) vs 2024 (Lamar 430.4) confirmed different. Career mode verified (Wilson 2890.14/157GP). |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | DONE — PASS (production only, local server stale) |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | RE-AUDIT SESSION 13 — API PASS. College: Pavia/Tennessee 4392 yds. Prospects: 319 2026 class. Separate endpoints verified (/api/college/players, /api/prospects). |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | DONE — PASS. 87 columns, 8 presets, modal opens on prod. Browser-verified. |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | DONE — PASS. FUNC-008 FIXED. Pin cache (_pinnedDataCache) survives filter changes. Separator row appears on prod. |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | DONE — API PASS, UI now unblocked (FUNC-001 fixed). |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | DONE — PASS. Code+UI verified. 24 call sites, all state serialized. |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | RE-AUDIT SESSION 21 — PARTIAL. Via player.html?id= PASS (0 JS errors). Via /player/{id} FAIL: 3 JS errors (FUNC-018 relative asset paths). FUNC-017 still NOT deployed (CMC shows +772%). Lab popup + profile link → broken page. FUNC-004 (headshots) still open. |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | DONE — PASS (Lamar 8 seasons sum exactly matches career totals: GP=124, PPR=2531.04, PassYds=24361) |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar 2024 game log=17 weeks (1-18 only), 17 GP. |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | RE-AUDIT SESSION 21 — PARTIAL. API PASS (compare endpoint returns correct data). Via /compare/{id1}/{id2} FAIL: 3 JS errors (FUNC-018 relative asset paths). Same broken page as player profiles. |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | DONE — Code PASS, API PASS. Career arc (multi-season PPG line), comp radar (5-6 stats, normalized), scatter (regression line div-by-zero fixed B-3), heat map (div-by-zero fixed B-3). All position-colored, theme-aware, DPI-scaled. |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | RE-AUDIT SESSION 19 — PASS. 0 JS errors, 23 rows, 69 sidebar items. 5 broken NFL headshot images (FUNC-004). No regressions from Ship Loop changes. |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | RE-AUDIT SESSION 20 — PASS. Prod: Chase=95.8, Gibbs=95.0, Robinson=94.7 (sensible top 3). FUNC-015 code fix verified (compute_trade_value unified). NOT DEPLOYED: screener dynasty_value still uses old formula on prod. No regressions from Ship Loop quality passes. |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | DONE — PASS |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | DONE — PASS (functional), P2 S-tier bloated (76 players, FUNC-003) |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | DONE — RB peak correct, P2 WR/TE survivorship bias |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | DONE — PASS. Code+API verified. 3 slots, autocomplete, PPG chart, career summary, PNG export. FUNC-001/006 now fixed. |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | RE-AUDIT SESSION 20 — PASS. FUNC-016 FIXED in code: inline onclick replaced with data-pid + addEventListener pattern (matching matchups.html fix). Pending deploy. |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | RE-AUDIT SESSION 13 — PASS. 2025 data: weeks 1-18 only (FUNC-012 holding). Allen 16GP, Stafford 17GP. |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | DONE — PASS. API returns ranked weekly performers (verified Barkley Wk1 2024 = 33.2 PPR, exact calc confirmed). Position filter works (QB-only returns QBs). Season/week navigation, sortable columns, top 3 badges, points tiers (elite/great/good). P2: 0 shows as '-' due to JS falsy (0 || '-'). |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | RE-AUDIT SESSION 17 — PASS. Post Session 18 XSS fix (data-pid + addEventListener replaces inline onclick). 32 teams in API. Pro-locked panel correctly gated. Font-display fix applied to table headers. 0 JS errors. |
| 28 | Stacks | QB-WR/TE stacks shown? Correlation data makes sense? | DONE — PASS (30 stacks, Pearson math correct). P2: min 5 common games too low, small-sample flukes dominate (Dalton+Johnson r=0.988 in 6G). Elite stacks (Allen, Hurts, Burrow) absent from top 30. |
| 29 | Breakouts | Candidates shown with data? Breakout criteria visible and reasonable? | DONE — PASS (50 candidates, RBS scores present, opp/prod gap logic sound). P2: snap_pct=0 due to FUNC-007 |
| 30 | Waivers | Waiver targets shown? FAAB values if applicable? Sorted by priority? | DONE — PASS (30 targets, delta math correct, 4-week window). P2: no ownership data, so "waivers" are just trending-up players (Bryce Young #1 = rostered everywhere). No FAAB values. |
| 31 | Streaks | Hot/cold streaks identified? Based on recent weeks, not season aggregate? | DONE — PASS (25 hot, 25 cold, recent_scores averages exact, football-sensible: Gibbs hot, Fields cold). |

## Group 5: Advanced Analytics Panels (the nerd stuff — has to be right)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 32 | Target Share / Air Yards | Values are percentages that sum correctly per team? WOPR calculated right? | DONE — PASS (per-team sums 89-93%) |
| 33 | Snap Efficiency | Snap % shown? Fantasy points per snap derived correctly? | DONE — PASS (calcs correct), P2 no min snap threshold |
| 34 | Red Zone | RZ targets/carries shown? RZ stats don't include non-RZ plays? | DONE — PASS (calcs correct, annotations good) |
| 35 | Opportunity Share | Opportunity = targets + carries? Per-team shares sum to ~100%? | DONE — PASS (alpha dogs), P2 FUNC-005: dominator rec shares null |
| 36 | Efficiency metrics | YPC, YPR, YPT calculated correctly from raw stats? Not showing NaN/Infinity for 0 attempts? | DONE — PASS (0 NaN/Inf in 200 players) |
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | RE-AUDIT SESSION 13 — PASS. 2025 data: Stafford +16.5 TD delta (sell), Jefferson -5.0 (buy). Math verified. |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | DONE — PASS (data sound, clean producers sensible). P2: no gt_ppg/clean_ppg split, backup scrubs dominate padders |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | DONE — PASS. API returns positive_script (winning) + negative_script (losing) splits. Barkley 22.2 PPG positive, B.Robinson 20.1 PPG negative — sensible. Position filter, season selector, diff badges, GT% chips, escapeHtml on all data. |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | DONE — PASS (DTI=geometric mean of rush+rec yd/g, all 3 verified exact) |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | DONE — PASS (CoV/StdDev/floor/ceiling verified from weekly data, grades sensible) |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | DONE — MOSTLY FIXED. FUNC-007 snap backfill deployed: McCaffrey 54.8 snaps/g, Taylor 51.9. 3 edge-case players still at 0. |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | DONE — PASS (exact calcs), P2 missing tier badges |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | DONE — PASS (nflverse ground truth PPR, small diffs from 2pt conv/fumbles not in basic stats) |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | RE-AUDIT SESSION 13 — PASS. 2026 class: 319 prospects, Green QB#1 RPS 72.8, combine data present (height/weight/forty). Phase F college refresh verified. |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | RE-AUDIT SESSION 15 — FUNC-011 FIXED. Bo Nix now 18.30 PPG/34 GP/2 seasons (was 33 PPG). COUNT(DISTINCT season\|\|week) prevents cross-season collision. 77 players in 2024 class, 7 rounds. |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | SKIP — /api/prospect-profiles returns 404. No dedicated endpoint. Prospect data available via /api/prospect-scores (Big Board, flow 45). |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | SKIP — /api/mock-draft returns 404. Not implemented. |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | SKIP — /api/prospect-radar returns 404. Not implemented. |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | SKIP — /api/custom-scoring returns 404. Not implemented as API endpoint. May be frontend-only. UI blocked by FUNC-001. |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | DONE — PASS. Save works (typed name, clicked Save, toast confirms). View appears in dropdown + manage modal list. Restores: universe, position, search, sort, filters, visual modes, columns, columnWidths. Max 20 enforced. Cloud sync for Pro. Delete with confirm. 0 JS errors. |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | RE-AUDIT SESSION 16 — PASS. B-2 fixes verified: modal opens on prod, stat selector populated, name+weight inputs work. XSS escape on delete button (B-2 fix). Init ordering fix (loadFormulas before loadStateFromURL) prevents formula column loss on URL restore. 0 JS errors. |
| 53 | Formula Store | Browse formulas. Install one. It works? Shows in column picker? | DONE — PASS. Store opens via Tools dropdown, fetches from /api/formulas/store (10 seed formulas). Cards render with ratings, position tags, descriptions. Search with 300ms debounce, sort (popular/top rated/recent). Install requires Pro (gated). XSS-safe. 0 JS errors. |
| 54 | Export PNG | Exports an image? Contains visible data? Watermark present? | DONE — PASS. Custom canvas renderer: title bar (mode/position/season/sort), column headers with sort indicator, position-colored badges, alternating row backgrounds, sort column highlight, "razzle.lol" watermark at 30% opacity. Downloads as PNG with season in filename. No html2canvas dependency for screener (only panels). Share modal also has PNG download button. 0 JS errors. |
| 55 | Export CSV | Downloads a CSV? Columns match what's on screen? Data correct? | DONE — PASS. Pro-gated with upgrade toast+link. Includes branding header, Player/POS/Team + all visible columns, csvEscape for special chars, BOM prefix for Excel compat. Descriptive filename (position-season-date). URL.revokeObjectURL cleanup. Toast with row count. Also available in Share modal. 0 JS errors. |
| 56 | Share URL | Copy URL. Open fresh. Exact same view restored? | DONE — Code+UI PASS (flow 12). FUNC-001 fixed, URL state verified. |

## Group 8: Navigation & Platform (the shell around the data)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 57 | Sidebar navigation | Every sidebar item loads its panel? No dead links? Category headers correct? | RE-AUDIT SESSION 16 — PASS. 69 sidebar items, 10 free + 59 pro-locked. FOREVER FREE + FREE PANELS + PRO sections. Panel switching via URL params (?panel=breakouts, ?panel=rankings) works. Tier gating intact (switchPanel checks FREE_PANELS + isPaidUser). 0 JS errors. |
| 58 | Command palette (Ctrl+K) | Opens? Finds panels by name? Finds players? Selection navigates correctly? | DONE — PASS. Opens via nav button, search input focused, "Search players... (Ctrl+K)" placeholder. Browser-verified on prod. |
| 59 | Dark mode | Every element switches? Data readable in dark? Charts visible? No white flashes? | RE-AUDIT SESSION 14 — PASS. Espresso flip palette verified via screenshot. 25 rows visible, text readable, position badges clear, no white flashes. Toggle works (0 JS errors). |
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | DONE — PASS. Modal opens, Sign In/Register tabs, email/password fields. Focus trap, Escape close, overlay click close. Rate limiting (3 reg/24hr), generic errors, loading states. Browser-verified on prod. |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | RE-AUDIT SESSION 16 — PASS. Post Phase E re-audit. "PICK YOUR PLAYBOOK" title, 3 plans (Free/$0, Pro/$79.99/yr, Elite/$149.99/yr), monthly/yearly toggle, trial banner "7 DAYS OF PRO. ON THE HOUSE.", feature lists, 13 buttons. 0 JS errors. |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | DONE — SESSION 12 VERIFIED. FUNC-012 DEPLOYED. Prod: Lamar GP=17, Burrow GP=17, PPG=25.3. Correct regular-season values. |

## Group 9: Bureau & Situation Room (the paid tier)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 63 | Bureau: League Intel | Sleeper connect flow? Roster loads? Insights generated from real league data? | RE-AUDIT SESSION 16 — PASS. Post Phase C re-audit. Connect card centered, input+button functional. Invalid "zzz_fake_user_999" → "agent not found in the field" error. Privacy note present. Dark mode clean (espresso flip). 0 JS errors. 7 inputs, 12 buttons. |
| 64 | Situation Room | Canvas loads? Agents rendered? Interaction works? | RE-AUDIT SESSION 16 — PASS. Post Phase D+H re-audit. "THE SITUATION ROOM" title, 6 agent tabs (Razzle/Scout/Diplomat/Quant/Medical/Historian), agent bio cards, pixel canvas with animated agents. Dark mode: warm espresso palette, no white flashes. 56 buttons, 16 inputs, 62 links. 0 JS errors. |

## Group 10: Edge Cases (the stuff that separates demos from products)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 65 | Empty states | No data, no leagues, new user. Every panel handles gracefully? | DONE — PASS. Search "zzzznonexistent" returns 0 players, count updates to "0 players", no crash. API returns {count:0, items:[]}. |
| 66 | Zero vs null | Players with 0 stats vs players with no data. Displayed differently? | DONE — PASS. Negative rushing yards displayed correctly (-10.0). API returns numeric 0 vs null cleanly. |
| 67 | Apostrophes & special chars | Amon-Ra St. Brown, D'Andre Swift, Ja'Marr Chase. Search/display handles? | DONE — PASS. All 3 found via search and API. Apostrophes display correctly in table and search. Browser-verified on prod. |
| 68 | Rapid interactions | Spam filter changes, double-click buttons, fast panel switching. Stable? | DONE — PASS. Rapid search swaps (mahomes→clear→allen→clear→chase) with 300ms intervals — final query returns correct 3 results. No race conditions. |
| 69 | Stale state | Apply filters, leave tab 10 min, come back. Still works? No expired tokens? | DONE — PASS. Backend cache TTL 2-5min expires cleanly, next request refetches. JWT 7-day expiry (no issue for idle). AbortController prevents race conditions on resume. Error handling preserves previous table data + toast. localStorage state persists across sessions. P2: Frontend query cache (LRU 5 entries) has NO TTL — serves cached data indefinitely until page refresh. Minor for stat data but could serve stale numbers if backend updates during session. |
| 70 | Cross-panel state | Set season in screener, switch to trade values panel. Same season? Or reset? | DONE — PASS. Rankings→TradeValues→Screener navigation returns correctly with 25 rows, 610 players. No state loss. |
