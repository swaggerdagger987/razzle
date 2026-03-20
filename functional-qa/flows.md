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
| 1 | Landing -> Lab | CTA click, initial data load, screener populates with real player data | PENDING |
| 2 | Screener: Position filter | Filter QB/RB/WR/TE individually. Count matches. Remove filter. Table resets? | PENDING |
| 3 | Screener: Multi-filter | Chain 3 filters (pos + team + min stat). Results are the correct intersection? | PENDING |
| 4 | Screener: Sort | Sort every stat column. #1 player is actually the leader? Reverse sort works? | PENDING |
| 5 | Screener: Search | Search "Mahomes", "McCaffrey", "Amon-Ra". Results correct? Clear resets? | PENDING |
| 6 | Screener: Season switch | Switch 2025 -> 2024 -> 2023. Data actually changes? Stat values match that season? | PENDING |
| 7 | Screener: Week filter | Select Week 1. Stats are single-week, not season totals? Switch back to All Weeks. | PENDING |
| 8 | Screener: Universe toggle | NFL -> College -> Prospects -> NFL. Correct data loads? Wrong-universe panels hide? | PENDING |
| 9 | Screener: Column picker | Add/remove columns. Presets load correct column sets? Custom columns persist? | PENDING |
| 10 | Screener: Pin player | Pin a row. Survives sort? Survives filter? Unpin works? Multiple pins? | PENDING |
| 11 | Screener: Pagination | Next/prev pages. Data advances? Page count correct? Sort persists across pages? | PENDING |
| 12 | Screener: URL state | Apply filters + sort + columns + season + week. Share URL. State restores exactly? | PENDING |

## Group 2: Player Deep Dives (where trade decisions happen)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 13 | Player profile: NFL | Click a player name. Profile loads? Stats match screener row? Season selector works? | PENDING |
| 14 | Player profile: Career stats | Career numbers add up across seasons? Per-game averages calculated correctly? | PENDING |
| 15 | Player profile: Game log | Individual game stats shown? Sum of game log = season total? Week numbers correct? | PENDING |
| 16 | Player comparison | Compare 2 players. Stats aligned? Same season? Difference calculations correct? | PENDING |
| 17 | Player charts | Radar/scatter/trend for a player. Data matches profile? Axes labeled correctly? | PENDING |

## Group 3: Dynasty & Trade Tools (the stuff people pay for)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 18 | Dynasty Rankings | Rankings load? Sortable? Position filter? Do rankings reflect age + production reality? | PENDING |
| 19 | Trade Values | Values load? Positional adjustment? Do elite young WRs > aging vets? Sensible tiers? | PENDING |
| 20 | Trade Finder | Suggest trades? Values make sense? Not suggesting obviously lopsided deals? | PENDING |
| 21 | Tiers | Tiers load? Players grouped sensibly? Tier breaks at reasonable spots? | PENDING |
| 22 | Aging Curves | Chart renders? Shows realistic age-based decline? Peak age correct per position? | PENDING |
| 23 | Career Compare | Multi-player career overlay? Same scale? Correct seasons aligned? | PENDING |

## Group 4: In-Season Tools (weekly grind features)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 24 | Cheat Sheet | Loads? Sortable? Position ranks correct? Matches screener sort order? | PENDING |
| 25 | Weekly Heatmap | Loads? Week selector works? Colors match stat intensity? | PENDING |
| 26 | Weekly Leaders | Loads? Leaders match that week's actual stat leaders? Category switch works? | PENDING |
| 27 | Matchups | Loads? Correct matchups for selected week? Opponent data shown? | PENDING |
| 28 | Stacks | QB-WR/TE stacks shown? Correlation data makes sense? | PENDING |
| 29 | Breakouts | Candidates shown with data? Breakout criteria visible and reasonable? | PENDING |
| 30 | Waivers | Waiver targets shown? FAAB values if applicable? Sorted by priority? | PENDING |
| 31 | Streaks | Hot/cold streaks identified? Based on recent weeks, not season aggregate? | PENDING |

## Group 5: Advanced Analytics Panels (the nerd stuff — has to be right)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 32 | Target Share / Air Yards | Values are percentages that sum correctly per team? WOPR calculated right? | PENDING |
| 33 | Snap Efficiency | Snap % shown? Fantasy points per snap derived correctly? | PENDING |
| 34 | Red Zone | RZ targets/carries shown? RZ stats don't include non-RZ plays? | PENDING |
| 35 | Opportunity Share | Opportunity = targets + carries? Per-team shares sum to ~100%? | PENDING |
| 36 | Efficiency metrics | YPC, YPR, YPT calculated correctly from raw stats? Not showing NaN/Infinity for 0 attempts? | PENDING |
| 37 | Regression candidates | TD regression logic sound? Flagging high-TD players with low expected TDs? | PENDING |
| 38 | Garbage Time | Identified correctly? Based on game script, not arbitrary cutoff? | PENDING |
| 39 | Gamescript | Game script data per player? Shows performance in various score differentials? | PENDING |
| 40 | Dual Threat | QB rushing + passing combined? RB receiving + rushing? Correct dual-threat metrics? | PENDING |
| 41 | Consistency | Week-to-week consistency calculated? Boom/bust rates make sense? | PENDING |
| 42 | Workload | Snap counts + touches trending? Workload share within team correct? | PENDING |
| 43 | VORP | Value over replacement calculated? Replacement level defined per position? Sensible? | PENDING |
| 44 | Scoring breakdown | Fantasy point sources broken down correctly? Passing + rushing + receiving = total? | PENDING |

## Group 6: Draft & Prospects (draft season critical path)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 45 | Big Board | Prospects ranked? Positional filter? Athletic data shown? | PENDING |
| 46 | Draft Class | Aggregate class metrics? Per-position breakdown? | PENDING |
| 47 | Prospect profiles | Click a prospect. Combine data correct? College stats shown? | PENDING |
| 48 | Mock Draft Board | Board loads? Picks assignable? Trade pick functionality? | PENDING |
| 49 | Prospect Radar | Athletic measurables visualized? Percentiles correct? Comparison works? | PENDING |

## Group 7: Tools & Export (the utility belt)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 50 | Custom Scoring | Change scoring weights. Screener recalculates? Values change appropriately? | PENDING |
| 51 | Saved Views | Save a view. Reload page. Load the view. Exact state restored? | PENDING |
| 52 | Formula Builder | Create a formula. Calculates? Appears as column? Math correct? | PENDING |
| 53 | Formula Store | Browse formulas. Install one. It works? Shows in column picker? | PENDING |
| 54 | Export PNG | Exports an image? Contains visible data? Watermark present? | PENDING |
| 55 | Export CSV | Downloads a CSV? Columns match what's on screen? Data correct? | PENDING |
| 56 | Share URL | Copy URL. Open fresh. Exact same view restored? | PENDING |

## Group 8: Navigation & Platform (the shell around the data)

| # | Flow | What to Test | Status |
|---|------|-------------|--------|
| 57 | Sidebar navigation | Every sidebar item loads its panel? No dead links? Category headers correct? | PENDING |
| 58 | Command palette (Ctrl+K) | Opens? Finds panels by name? Finds players? Selection navigates correctly? | PENDING |
| 59 | Dark mode | Every element switches? Data readable in dark? Charts visible? No white flashes? | PENDING |
| 60 | Auth flow | Sign in modal opens? Closes cleanly? Error states for bad input? | PENDING |
| 61 | Pricing page | All plans shown? CTAs work? Correct prices? Checkout starts? | PENDING |
| 62 | Dashboard / Stat Leaders | Summary stats populated? Leaders match screener data? Category switching works? | PENDING |

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
