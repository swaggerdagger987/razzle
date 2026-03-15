# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

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
