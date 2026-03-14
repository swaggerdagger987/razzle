# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Lab Toolbar Redesign — Declutter + Settings Panel

**Exit Criterion**: Screener toolbar is clean, intuitive, and works on mobile. Power-user display toggles live in a collapsible settings panel. Primary actions are instantly findable. Mobile toolbar doesn't overflow or require 4 rows of buttons.

### Task 1: Create a Settings/Display panel for toggle buttons
**Requirement**: The screener toolbar currently has 30+ buttons in a flat row — completely unusable, especially on mobile. Move all display/visualization toggles into a collapsible "Display" or gear icon settings panel that opens as a dropdown or slide-out. The following buttons should move OUT of the main toolbar and INTO the settings panel:
- Pctl (percentile mode)
- Bars (data bars)
- Top 3 (leader badges)
- Diff (diff mode)
- Tiers (tier breaks)
- Dense (density toggle)
- Groups (group headers)
- Summary (summary bar)
- Heat (heat colors)
- Heat Map
- Fantasy Only (relevance toggle)

The settings panel should use chunky toggle switches or checkboxes, grouped logically (e.g. "Data Display" for Pctl/Bars/Top3/Diff, "Table Layout" for Dense/Groups/Tiers/Summary, "Color" for Heat/Heat Map). Panel opens from a single button in the toolbar.
**Accept when**: Main toolbar has ~15 or fewer primary buttons. Settings panel contains all display toggles. All toggles still work. Keyboard shortcuts (H, R, B, L, I, T, D, G, A) still work.
**Depends on**: none
**Size**: L

### Task 2: Reorganize remaining toolbar into logical groups
**Requirement**: After moving toggles to settings, reorganize the remaining toolbar buttons into clear groups with visual separators:

**Row 1 — Core controls**: Position chips (ALL/QB/RB/WR/TE) | Search | Season | Settings
**Row 2 — Data tools**: Preset | Columns | Formulas | Custom Scoring | Filters (+ add filter)
**Row 3 — Actions**: Compare | Trade | Charts | CSV | Share | PNG

Hide contextual buttons until relevant: Undo/Redo only when there's history. Tags only when tags exist. Export Rankings / Trade Values / Aging Curves / Heat Map only when on relevant panel views. Watchlist behind a less prominent icon.

On mobile (<768px): Row 1 stays visible. Rows 2-3 collapse into a "More tools" expandable section or bottom sheet.
**Accept when**: Toolbar is 2 rows max on desktop. Mobile shows core controls + expandable "More". No functionality removed — just reorganized. No horizontal overflow.
**Depends on**: Task 1
**Size**: L

### Task 3: Mobile toolbar — touch-friendly and compact
**Requirement**: On screens below 768px, the toolbar should: (1) show position chips + search + season on the main bar, (2) collapse everything else into a slide-up bottom sheet or expandable "Tools" button, (3) all touch targets >= 44px, (4) no horizontal scrolling on the toolbar, (5) filter bar collapses to a chip summary (e.g. "3 filters") that expands on tap. The current 4-row button dump is completely broken on mobile.
**Accept when**: Mobile screener toolbar fits in 1-2 rows. All tools accessible via expandable panel. No overflow. Touch-friendly.
**Depends on**: Task 2
**Size**: M

---

## Phase: Monte Carlo League Odds — Bureau Feature

**Exit Criterion**: Connected Sleeper leagues show live championship/playoff odds for every manager. Summary cards visible to free users. Deep-dive panel with scenario explorer available to Pro users. Design doc: `docs/plans/2026-03-14-monte-carlo-league-odds-design.md`.

### Task 1: Backend — projection distribution builder
**Requirement**: Create `backend/live_data/simulate.py` with a function that takes roster player IDs + scoring settings and returns per-player projection distributions (mean, stddev, floor, ceiling). Pull from `player_week_stats` (up to 3 seasons). Apply time-of-year blending: offseason = prior seasons only with age-curve adjustment, in-season = weighted blend shifting toward current season as weeks accumulate (week 1 = 20/80, week 10 = 70/30). Rookies without history get historical rookie distributions by draft position + position. Injured players zeroed or reduced. Add `POST /api/league/simulate` endpoint in server.py that accepts Sleeper roster data + scoring settings and returns the distributions JSON.
**Accept when**: Endpoint returns valid distributions for a test payload. Mean/stddev are reasonable (e.g., elite WR ~18ppg, stddev ~6). Floor/ceiling clamp correctly. Rookies get distributions. Run pytest.
**Depends on**: none
**Size**: L

### Task 2: Frontend — Monte Carlo simulation engine
**Requirement**: Create `frontend/league-simulate.js` with a Monte Carlo engine that takes the backend distributions and runs 10,000 simulations in-browser. For each sim: sample random weekly scores per player (Box-Muller normal distribution, clamped to floor/ceiling), auto-set optimal lineups by position slots, determine matchup winners, combine with actual results, simulate playoffs, record champion. Output per manager: championship %, playoff %, projected W-L, median finish, floor/ceiling finish, power score (0-100). Must complete 10,000 sims in under 2 seconds.
**Accept when**: Engine runs 10k sims in <2s. Output percentages sum to ~100% for championship. Reasonable distributions (best team highest odds, worst team lowest). Re-simulation on roster change is instant.
**Depends on**: Task 1
**Size**: L

### Task 3: UI — Summary odds cards (FREE tier)
**Requirement**: Add summary odds cards to the top of the Bureau page (league-intel.html), visible immediately after Sleeper league connection. One card per manager sorted by championship odds descending. Each card shows: manager name, rank, championship % (Luckiest Guy font, large), progress bar (green >25%, orange 10-25%, red <10%), playoff %, projected W-L, delta arrow showing week-over-week change (in-season only). Cards use chunky Razzle styling (3px border, 4px offset shadow, slight rotation +/-1deg). Caveat annotation "based on 10,000 simulations" below. Mobile: stack vertically, top 3 visible, rest behind "Show all managers" expand.
**Accept when**: Cards render for all managers in a connected league. Sorted by championship odds. Responsive on mobile. Chunky Razzle styling matches DESIGN.md. Free users can see all cards.
**Depends on**: Task 2
**Size**: M

### Task 4: UI — Deep-dive panel (PRO tier)
**Requirement**: Clicking a summary card expands a deep-dive panel below. Pro-gated — free users see blurred preview + upgrade CTA. Four tabs: (1) Odds Board — full sortable league table with sparkline trend column, (2) Distribution Charts — histogram of simulated win totals, finish position bar chart, roster strength breakdown by position group, (3) Scenario Explorer — trade ("I give X / I receive Y"), waiver ("add X / drop Y"), injury ("remove X from roster") with instant re-simulation showing before/after championship % delta, (4) Odds History — week-by-week line chart of all managers' championship % over the season (populates in-season only, stored in localStorage keyed by razzle_odds_{league_id}). All charts reuse existing Lab canvas patterns.
**Accept when**: All four tabs render and function. Scenario explorer re-simulates instantly without API call. Pro gating works (free = blurred + CTA). Odds history persists across visits via localStorage. Charts match Razzle chunky styling.
**Depends on**: Task 3
**Size**: XL
