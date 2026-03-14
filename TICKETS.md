# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Bureau of Intelligence — Build Profiles

**Exit Criterion**: Bureau has a "Build Profiles" panel categorizing each manager's roster construction archetype.

### Task 1: Build roster construction profiling panel
**Requirement**: Add a "Build Profiles" panel that categorizes each manager's roster construction style based on their Sleeper roster composition: (1) Hero RB — 1 elite RB, thin elsewhere, (2) Zero RB — loaded at WR/TE, light at RB, (3) Balanced — even distribution across positions, (4) Stars & Scrubs — top-heavy roster, weak bench, (5) Youth Movement — average age < 25, dynasty builders, (6) Win Now — average age > 27, veterans everywhere. Show each manager's archetype as a chunky badge. Add a radar chart comparing positional investment (% of roster trade value at QB/RB/WR/TE). Archetype detection: use PPG and trade value data to classify starter quality vs bench quality vs age profile. Each card should read like a scouting report: "Stars & Scrubs — if his RB1 goes down, he's cooked."
**Accept when**: Every manager gets an archetype badge. Radar chart renders. Archetypes are reasonable based on roster composition. Scouting-report flavor text on each card.
**Depends on**: none
**Size**: L

---

## Phase: Bureau of Intelligence — Trade Network

**Exit Criterion**: Bureau shows a trade relationship map between all managers.

### Task 1: Build trade network visualization
**Requirement**: Add a "Trade Network" panel showing trade relationships: (1) Trade frequency matrix — grid/table showing how often each pair of managers trades with each other (from Sleeper transaction history), (2) Trade balance — for each pair, who has "won" more trades (compare trade value at time of trade using Razzle valuations), (3) Trade timing — does each manager trade early season, deadline, or offseason? (4) Position tendencies — what positions does each manager trade away vs acquire? (5) "Most likely trade partner" recommendation for the current user based on historical patterns + current roster needs. Pull transaction data from Sleeper API (already fetched in league-intel.html for activity feed). Cross-reference player names with Razzle trade values.
**Accept when**: Trade matrix renders for leagues with trade history. Balance column shows value exchanged. Position tendencies visible per manager. Trade partner recommendation renders.
**Depends on**: none
**Size**: L

---

## Phase: Bureau of Intelligence — Waiver Tendencies

**Exit Criterion**: Bureau shows waiver/FA analysis per manager.

### Task 1: Build waiver analysis panel
**Requirement**: Add waiver/FA analysis per manager: (1) FAAB budget remaining vs spent (if FAAB league — check league settings), (2) Total waiver claims count per season, (3) Position bias — what positions do they claim most? (4) Hit rate — of their pickups, how many were still rostered 4+ weeks later? (estimate from transaction history), (5) "Waiver hawk" score 0-100 measuring aggressiveness (claims per week, FAAB spend rate, speed of claims). Use existing transaction data already parsed from Sleeper API in league-intel.html. Display as chunky cards with bar charts per manager, sorted by hawk score.
**Accept when**: Waiver panel renders with real transaction data. FAAB tracking works for FAAB leagues. Hawk score differentiates aggressive vs passive managers. Position bias visible.
**Depends on**: none
**Size**: L

---

## Phase: Bureau of Intelligence — League Power Rankings

**Exit Criterion**: Bureau has composite power rankings beyond simple W-L.

### Task 1: Build league power rankings panel
**Requirement**: Add "Power Rankings" panel: (1) Composite score from roster strength (total trade value), recent performance (if in-season), depth score (from depth analysis), and transaction activity, (2) Weekly movement arrows up/down, (3) Tier groupings — Contenders / Bubble / Rebuilding (based on score distribution), (4) "If the season ended today" playoff bracket preview based on current standings + roster strength, (5) Each manager card shows rank, composite score, tier badge, and key strength/weakness. This should be the FIRST panel users see when entering the Bureau — the overview before diving into specifics. Use trade value data from Razzle + roster data from Sleeper.
**Accept when**: Power rankings render with composite scores. Tier groupings visible and reasonable. Playoff bracket preview renders. Cards show rank + score + tier.
**Depends on**: none
**Size**: L

---

## Phase: Bureau of Intelligence — Head-to-Head Rivalry Analysis

**Exit Criterion**: Users can select two managers and see full head-to-head comparison.

### Task 1: Build H2H comparison view
**Requirement**: Add ability to click any two managers and see a full head-to-head comparison: (1) All-time record against each other (from matchup history in Sleeper), (2) Roster comparison — side by side, position by position, who has the edge at each slot (compare PPG/trade value), (3) Trade history between them (from transactions), (4) Strengths/weaknesses relative to each other — "You have the edge at WR, they have the edge at RB", (5) Overall matchup verdict — "You win this matchup 60% of the time" (simple strength comparison). Two-column layout with chunky Razzle card styling. User picks their team on the left, opponent on the right via dropdown.
**Accept when**: Select any two managers → full H2H comparison renders. Roster comparison shows position-by-position edges. Trade history between the pair visible. Verdict renders.
**Depends on**: none
**Size**: L

---

## Phase: Bureau of Intelligence — Self-Scout (Default View)

**Exit Criterion**: Connected user sees their own team analyzed first when entering the Bureau.

### Task 1: Build self-scout as default Bureau view
**Requirement**: When a user connects their Sleeper league, the Bureau should default to showing THEIR OWN team analysis — not a generic league overview. Auto-detect which roster belongs to the connected user (match `owner_id` from Sleeper rosters to the connected username's user_id). Show: (1) "Your Team" header with their manager name, (2) Their depth analysis (starter quality, bench depth, vulnerability flags), (3) Their build profile archetype badge, (4) Their power ranking position and tier, (5) "How opponents see you" summary — what a smart rival would target (your weakest position, your most tradeable surplus), (6) Quick links to each rival's profile. This is the "home base" of the Bureau — "here's your team, here's where you're strong, here's where you're vulnerable." Clicking any rival name navigates to their full profile.
**Accept when**: Connected user sees their own team by default. All analysis panels (depth, profile, power rank) populated for the user's own roster. "How opponents see you" renders. Rival quick links work.
**Depends on**: none
**Size**: L

---

## Phase: Lab Panel-by-Panel Audit — Batch 1 (A-D)

**Exit Criterion**: All Lab panels A-D load, render data, match DESIGN.md, zero JS errors.

### Task 1: Audit and fix panels A-D
**Requirement**: Open each panel one by one: advantage, aging, airyards, archetypes, auction, awards, breakdown, breakouts, buysell, career, career-compare, cheatsheet, compare, comptable, consistency, correlations, dashboard, draftclass, drafttracker, drops, dualthreat. For each: (1) Does it load without JS errors? (2) Does it render real data from the API? (3) Do colors use CSS vars only (no hardcoded hex)? (4) Are fonts correct (Space Mono for data, Luckiest Guy for titles only, Caveat for annotations)? (5) Are borders 2px+ and shadows 4px offset? (6) Does mobile scroll horizontally on tables? (7) Do player names have click handlers (popup)? Fix every issue found. Log each panel's status in PROGRESS.md.
**Accept when**: All 21 panels load, render data, match design guide. Zero console errors. Player clicks work.
**Depends on**: none
**Size**: XL

---

## Phase: Lab Panel-by-Panel Audit — Batch 2 (E-P)

**Exit Criterion**: All Lab panels E-P pass same audit criteria.

### Task 1: Audit and fix panels E-P
**Requirement**: Same audit as Batch 1 for: efficiency, explorer, fptsbreakdown, gamelog, gamescript, garbagetime, handcuffs, leaders, matchups, mockdraft, opportunity, pace, percentiles, playoffs, powerrankings, proradar.
**Accept when**: All 16 panels pass same criteria as batch 1.
**Depends on**: none
**Size**: XL

---

## Phase: Lab Panel-by-Panel Audit — Batch 3 (R-Z)

**Exit Criterion**: All Lab panels R-Z pass same audit criteria. Every single Lab panel verified.

### Task 1: Audit and fix panels R-Z
**Requirement**: Same audit as Batch 1 for: rankings, recap, records, redzone, reportcard, rosterbuilder, scarcity, schedule, scoring, seasonpace, snapefficiency, stacks, stocks, streaks, strengths, successrate, targetpremium, targets, tdregression, team, tiers, tradefinder, tradevalues, usage, vorp, waivers, weekly, weeklyleaders, weeklymvp, workload, yoy.
**Accept when**: All 33 panels pass same criteria. Every single Lab panel verified and logged in PROGRESS.md.
**Depends on**: none
**Size**: XL
