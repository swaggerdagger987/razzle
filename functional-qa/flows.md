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
| 1 | Landing -> Lab | CTA click, initial data load, screener populates with real player data | RE-AUDIT — FUNC-001 code-fixed but NOT DEPLOYED (P0 FUNC-006). Lab still crashes on prod. |
| 2 | Screener: Position filter | Filter QB/RB/WR/TE individually. Count matches. Remove filter. Table resets? | DONE — PASS (all 4 positions clean) |
| 3 | Screener: Multi-filter | Chain 3 filters (pos + team + min stat). Results are the correct intersection? | DONE — PASS (RB+800yd = 27, all correct) |
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | DONE — PASS (desc+asc both correct) |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | RE-AUDIT — FUNC-002 code-fixed but NOT DEPLOYED (FUNC-006). Amon-Ra/Ja'Marr still return 0. |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | DONE — PASS |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | DONE — PASS (production only, local server stale) |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | DONE — API PASS, UI blocked by FUNC-001 |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | DONE — Code PASS, UI blocked by FUNC-001 |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | DONE — Code PASS. Max 5 cap, localStorage+URL persist, diff mode, bulk pin. P2: pinned rows vanish when filtered out of state.items (data not retained cross-filter). UI blocked by FUNC-006. |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | DONE — API PASS, UI blocked by FUNC-001 |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | DONE — Code PASS. 24 call sites, all state serialized (filters/sort/cols/season/week/pins/visual modes), validated on restore (position enum, sort key against column defs, filters type-checked, columns filtered through known maps). localStorage fallback. UI blocked by FUNC-006. |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | DONE — PASS (data correct), P1 FUNC-004: all headshots missing on prod |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | DONE — PASS (Lamar 8 seasons sum exactly matches career totals: GP=124, PPR=2531.04, PassYds=24361) |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | DONE — PASS (19 weeks for Lamar 2024, PPR sum=471.54 matches season total) |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | DONE — PASS (Jackson vs Stroud 2024, data aligned, same season) |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | DONE — Code PASS, API PASS. Career arc (multi-season PPG line), comp radar (5-6 stats, normalized), scatter (regression line div-by-zero fixed B-3), heat map (div-by-zero fixed B-3). All position-colored, theme-aware, DPI-scaled. |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | RE-AUDIT — FUNC-003 code-fixed but NOT DEPLOYED (FUNC-006). Top 7 still at 100.0 on prod. |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | DONE — PASS (same clustering note as #18) |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | DONE — PASS |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | DONE — PASS (functional), P2 S-tier bloated (76 players, FUNC-003) |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | DONE — RB peak correct, P2 WR/TE survivorship bias |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | DONE — Code PASS, API PASS. 3 player slots, autocomplete, PPG trajectory chart (multi-line, DPI-aware), career summary table (7 metrics, best-value highlighting), season-by-season PPG table (all seasons union), URL state (?p1=&p2=), PNG export. Division-by-zero guarded. UI blocked by FUNC-006. |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | DONE — PASS (4 pos groups, Jackson QB#1 PPG=24.82, tiers+ranks correct) |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | DONE — PASS (22 weeks data, sums match season totals within rounding) |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | DONE — PASS. API returns ranked weekly performers (verified Barkley Wk1 2024 = 33.2 PPR, exact calc confirmed). Position filter works (QB-only returns QBs). Season/week navigation, sortable columns, top 3 badges, points tiers (elite/great/good). P2: 0 shows as '-' due to JS falsy (0 || '-'). |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | DONE — PASS (32 teams, ranks 1-32 unique, math 128/128 correct, detail works). P2 FUNC-009: includes playoff games (PHI 21 games vs 17 reg season). |
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
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | DONE — PASS (calcs exact, rates sensible) |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | DONE — PASS (data sound, clean producers sensible). P2: no gt_ppg/clean_ppg split, backup scrubs dominate padders |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | DONE — PASS. API returns positive_script (winning) + negative_script (losing) splits. Barkley 22.2 PPG positive, B.Robinson 20.1 PPG negative — sensible. Position filter, season selector, diff badges, GT% chips, escapeHtml on all data. |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | DONE — PASS (DTI=geometric mean of rush+rec yd/g, all 3 verified exact) |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | DONE — PASS (CoV/StdDev/floor/ceiling verified from weekly data, grades sensible) |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | DONE — P1 FUNC-007: snaps_pg=0 and snap_pct=None for ALL players. Touches data correct. |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | DONE — PASS (exact calcs), P2 missing tier badges |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | DONE — PASS (nflverse ground truth PPR, small diffs from 2pt conv/fumbles not in basic stats) |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | DONE — PASS. 319 prospects for 2026 class. RPS scoring (athletic_avg + draft_capital + size), 4 tiers (Elite/Premium/Solid/Raw), percentile bars for combine metrics. Position filter works (16 QBs). Field names aligned (player_name, rps, height_display). |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | DONE — 7-round breakdown, per-round math correct. P0 FUNC-011: PPG inflated for multi-season players (COUNT DISTINCT week collapses across seasons — Bo Nix shows 33 PPG, actual ~20). |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | SKIP — /api/prospect-profiles returns 404. No dedicated endpoint. Prospect data available via /api/prospect-scores (Big Board, flow 45). |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | SKIP — /api/mock-draft returns 404. Not implemented. |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | SKIP — /api/prospect-radar returns 404. Not implemented. |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | SKIP — /api/custom-scoring returns 404. Not implemented as API endpoint. May be frontend-only. UI blocked by FUNC-001. |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | BLOCKED — UI blocked by FUNC-001. Code audit: localStorage-based, max 20 views, manage modal exists. |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | BLOCKED — UI blocked by FUNC-001. |
| 53 | Formula Store | Browse formulas. Install one. It works? Shows in column picker? | BLOCKED — UI blocked by FUNC-001. |
| 54 | Export PNG | Exports an image? Contains visible data? Watermark present? | BLOCKED — UI blocked by FUNC-001. |
| 55 | Export CSV | Downloads a CSV? Columns match what's on screen? Data correct? | BLOCKED — UI blocked by FUNC-001. |
| 56 | Share URL | Copy URL. Open fresh. Exact same view restored? | DONE — Code PASS (flow 12). UI blocked by FUNC-001. |

## Group 8: Navigation & Platform (the shell around the data)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 57 | Sidebar navigation | Every sidebar item loads its panel? No dead links? Category headers correct? | DONE — 76 nav links, 69 tools. Categories: FOREVER FREE (Screener), FREE PANELS (9), PRO (sections with lock icons). Clicking panels blocked by FUNC-001 (init crash prevents panel rendering). |
| 58 | Command palette (Ctrl+K) | Opens? Finds panels by name? Finds players? Selection navigates correctly? | BLOCKED — UI blocked by FUNC-001 (init crash). |
| 59 | Dark mode | Every element switches? Data readable in dark? Charts visible? No white flashes? | DONE — PASS (visual). Dark mode applies cleanly: brown palette, readable text, proper contrast, no white flashes. Sidebar and main area both switch correctly. Charts untestable (FUNC-001). |
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | PENDING |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | PENDING |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | DONE — API PASS. 10 categories, Lamar #1 PPG=24.8 (cross-checks exact). Scoring comparison: 40 risers + 40 fallers, all math correct. Season awards: 10 awards, football-sensible. P2: Rising Stock winner is WR5 with 2 PPG (small-sample artifact). |

## Group 9: Bureau & Situation Room (the paid tier)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 63 | Bureau: League Intel | Sleeper connect flow? Roster loads? Insights generated from real league data? | PENDING |
| 64 | Situation Room | Canvas loads? Agents rendered? Interaction works? | PENDING |

## Group 10: Edge Cases (the stuff that separates demos from products)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 65 | Empty states | No data, no leagues, new user. Every panel handles gracefully? | PENDING |
| 66 | Zero vs null | Players with 0 stats vs players with no data. Displayed differently? | PENDING |
| 67 | Apostrophes & special chars | Amon-Ra St. Brown, D'Andre Swift, Ja'Marr Chase. Search/display handles? | PENDING |
| 68 | Rapid interactions | Spam filter changes, double-click buttons, fast panel switching. Stable? | PENDING |
| 69 | Stale state | Apply filters, leave tab 10 min, come back. Still works? No expired tokens? | PENDING |
| 70 | Cross-panel state | Set season in screener, switch to trade values panel. Same season? Or reset? | PENDING |
