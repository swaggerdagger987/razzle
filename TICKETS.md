# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

---

## Phase: REDO — Sidebar "Forever Free" + Pro Nesting (previous fix incomplete)

**Exit Criterion**: Lab sidebar top category says "FOREVER FREE" (not "Free" or "FREE"). All other categories nested under a "PRO" parent.

### Task 1: Verify and fix sidebar labels and nesting
**Requirement**: The previous fix added a "Free" label but did not use "FOREVER FREE" and did not nest all other categories under a "PRO" parent header. Open lab.html, find the sidebar HTML. The first category must say "FOREVER FREE" in Luckiest Guy font. Below the 10 free panels, add a "PRO" category header. All existing subcategories (Rankings & Values, Discovery, Performance, Game Analysis, Trends & Projections, College, Player Tools, League Tools, Records & History, Teams) must be children of the PRO section. "FOREVER FREE" must be always expanded, not collapsible.
**Accept when**: Sidebar reads "FOREVER FREE" at top. "PRO" header wraps all other categories. Visual hierarchy is clear.
**Depends on**: none
**Size**: M

---

## Phase: REDO — Big Board UI Still Raw (previous fix incomplete)

**Exit Criterion**: Big Board panel is fully polished with Razzle styling.

### Task 1: Full visual audit of Big Board panel
**Requirement**: The Big Board (prospects panel) was claimed fixed but still has raw/unstyled elements. Open the Big Board panel in the browser and audit every element: (1) All text uses correct fonts. (2) All colors use CSS vars. (3) Table has proper borders, shadows, and spacing. (4) Position badges use correct colors. (5) Dropdowns and inputs are styled with chunky Razzle aesthetic. (6) Mobile scrolls horizontally. (7) No raw HTML elements or unstyled containers. Fix everything that doesn't match DESIGN.md.
**Accept when**: Big Board looks as polished as the screener. Zero raw elements. Matches DESIGN.md completely.
**Depends on**: none
**Size**: L

---

## Phase: REDO — Brand Copy Not Fully Updated (previous fix incomplete)

**Exit Criterion**: Every page says "The Screener is forever free" — not "The Lab is free" or any old positioning.

### Task 1: Grep and replace all old brand copy
**Requirement**: The previous brand copy update was incomplete. Run `grep -ri "lab is free\|lab is the product\|the lab.*free\|free tier\|free plan" frontend/` and fix every match. Replace with "The Screener is forever free" or equivalent per context. Check: index.html hero, pricing.html, about.html, agents.html, all og:description meta tags, all inline text. The brand line is: "The Screener is forever free. The intelligence is what you pay for."
**Accept when**: Zero instances of "Lab is free" or "free tier" across all frontend files. "Forever free" appears on landing page and pricing page.
**Depends on**: none
**Size**: M

---

## Phase: REDO — Share Button Still Not Capturing Full State

**Exit Criterion**: Share button on every page generates a URL that restores the exact current view.

### Task 1: Verify and fix share URL state serialization
**Requirement**: The share button was claimed fixed but may still not capture full state. Test on: (1) Screener with 3 filters + custom sort + non-default columns — does the shared URL restore all of them? (2) A non-screener panel (e.g., Trade Values) — does the URL include `?panel=tradevalues`? (3) Bureau with a connected Sleeper username. (4) Standalone pages with season filters. Fix any gaps in URL state serialization.
**Accept when**: Share URL round-trips perfectly on screener (filters, sort, columns, season, position). Panel share URLs open the correct panel. Tested on 3+ scenarios.
**Depends on**: none
**Size**: M

---

## Phase: URGENT — Dark Mode Font Legibility

**Exit Criterion**: All text in dark mode uses warm sand colors with sufficient contrast. No white text on dark brown backgrounds using display fonts at small sizes.

### Task 1: Audit and fix dark mode text across all pages
**Requirement**: Dark mode still has legibility issues — some text uses cold white or wrong fonts. Audit every page in dark mode (`[data-theme="dark"]`): (1) All body text should use `var(--ink)` which maps to `#ede0cf` (warm sand) in dark mode, never raw `#fff` or `white`. (2) All buttons/chips/controls should use Space Mono (per the earlier font fix), NOT Luckiest Guy at small sizes. (3) Check contrast ratios — text on `var(--bg-ink)` (#1a110a) backgrounds must be readable. (4) Check the Situation Room specifically — it's always dark mode regardless of toggle. Fix any remaining `color: white`, `color: #fff`, or low-contrast text across all pages and CSS.
**Accept when**: Toggle dark mode on every page — all text is legible. No cold white. No Luckiest Guy on buttons. Situation Room text readable. Minimum 4.5:1 contrast ratio on all body text.
**Depends on**: none
**Size**: M

---

## Phase: URGENT — Monte Carlo Endpoint Broken (wrong table name)

**Exit Criterion**: `/api/monte-carlo/projections` returns valid player distributions.

### Task 1: Fix table name and column name in Monte Carlo endpoint
**Requirement**: In `backend/server.py` line ~3220, the Monte Carlo projections endpoint queries `FROM stats` but the actual table is `player_week_stats`. Also the standard scoring column is `fantasy_points` but should be `fantasy_points_std`. Fix: (1) Change `FROM stats` to `FROM player_week_stats` on line 3220. (2) Change the standard scoring mapping from `"standard": "fantasy_points"` to `"standard": "fantasy_points_std"` on line 3206. (3) Run `python -m pytest tests/ -v` to verify no regressions.
**Accept when**: POST to `/api/monte-carlo/projections` with valid player_ids returns distributions JSON. No "Method Not Allowed" or SQL errors. League odds cards render in the Bureau.
**Depends on**: none
**Size**: S

---

## Phase: URGENT — Screener Toolbar Complete Redesign

**Exit Criterion**: Screener toolbar is 1 row on desktop, expandable on mobile. Only essential controls visible by default. Everything else behind a single "Tools" dropdown or panel.

### Task 1: Reduce toolbar to ONE row of essential controls
**Requirement**: The screener toolbar currently has 25+ buttons in 4 rows. This is unusable. Redesign to ONE primary row with only these items visible:

**Primary row (always visible):**
Position chips (ALL/QB/RB/WR/TE) | Search input | Season dropdown | Preset dropdown | Columns | Formulas | + Filter | Tools dropdown

**"Tools" dropdown (click to open, contains everything else):**
Group into sections inside the dropdown:
- **View**: Charts, Compare, Watchlist, My Roster, Saved Views, Save View
- **Export**: CSV, Share, PNG, Export Rankings
- **Display**: Fantasy Only, Heat, Heat Map, Pctl, Bars, Top 3, Diff, Tiers, Dense, Groups, Summary (as toggle switches)
- **Analysis**: Trade, Trade Values, Aging Curves

**Hidden until relevant:**
- Undo/Redo — only show when there's history
- Tags — only show when tags exist
- Export Rankings / Trade Values / Aging Curves / Heat Map — only show when on relevant panel

DELETE the bottom row entirely (Export Rankings, Trade Values, Aging Curves, Heat Map as always-visible buttons). They go inside Tools dropdown.

The toolbar should feel like Google Sheets — one clean row with a menu for power features. Not a cockpit with every button exposed.
**Accept when**: Toolbar is 1 row on desktop. "Tools" dropdown contains all secondary actions. All functionality preserved — nothing removed, just reorganized. Keyboard shortcuts still work. Mobile: position chips + search visible, everything else in Tools.
**Depends on**: none
**Size**: L

---

## Phase: Explorer Panel — Fix Dot Hover Tooltips

**Exit Criterion**: Hovering over any dot in the Explorer scatter plot shows the correct player name, team, and stat values.

### Task 1: Fix hover tooltip on Explorer scatter plot dots
**Requirement**: The Explorer panel scatter plot dots don't show accurate hover information — either the tooltip doesn't appear, shows the wrong player, or misaligns with the dot position. Debug the canvas/SVG hover detection in the Explorer panel render function in `lab-panels.js`: (1) Check if the hit detection uses correct x/y coordinates matching the dot positions. (2) Check if the tooltip data maps to the right player index. (3) If using canvas (not SVG), the hover detection needs to calculate distance from mouse to each dot and show the nearest one. (4) Tooltip should show: player name, team, position, and the x/y stat values. (5) Ensure tooltip follows the mouse or anchors near the dot without clipping off-screen.
**Accept when**: Hover over any dot → tooltip shows correct player name, team, position, and both stat values. Tooltip tracks accurately with dot position. Works on all axis combinations.
**Depends on**: none
**Size**: M

---

## Phase: URGENT — Player Click Popup Broken on Non-Screener Panels

**Exit Criterion**: Clicking a player name on ANY Lab panel opens the player detail popup, same as the screener.

### Task 1: Fix player click on all Lab panels
**Requirement**: Clicking a player name in the screener opens a player detail popup. Clicking a player name on any other Lab panel (Dynasty Rankings, Trade Values, Breakouts, Efficiency, Weekly Heatmap, etc.) does NOTHING. The popup only works on the screener. Fix this by ensuring every player name rendered in `lab-panels.js` has a click handler that triggers the same popup. The screener's player click handler is likely in `lab.js` — find it, extract it to a shared function accessible from all panels, and attach it to every player name element rendered by `lab-panels.js`. Player names in panels are likely rendered as plain text in `<td>` elements — wrap them in clickable `<a>` or `<span>` elements with the onclick handler. The popup needs the player's ID or name to fetch their profile data.
**Accept when**: Click any player name on any of the 70+ Lab panels → same popup as screener appears. Test on at least 5 different panels (Rankings, Trade Values, Breakouts, Weekly Heatmap, Efficiency). Popup dismisses on Escape/outside click.
**Depends on**: none
**Size**: L

---

## Phase: Remove nflverse / Data Source References From UI

**Exit Criterion**: Zero visible references to "nflverse", "cfbfastR", or any data source name across the entire frontend. One fine-print attribution in the FAQ only.

### Task 1: Remove all nflverse/data source mentions from frontend
**Requirement**: Search the entire frontend/ directory for any mention of "nflverse", "nfl verse", "cfbfastR", "cfb", "powered by nflverse", "data source", "data provided by", or similar attribution text. Remove ALL of them — from footers, panel labels, loading states, watermarks, about page, landing page, Lab footer bar ("powered by nflverse"), screener data source labels, and anywhere else. The only surviving mention should be one line in the pricing.html FAQ section: "Where does the data come from?" → "Player statistics are sourced from publicly available NFL and NCAA data." Keep it vague and generic. No specific project names.
**Accept when**: `grep -ri "nflverse\|cfbfastr\|cfb_" frontend/` returns zero matches outside of the FAQ line. No data source attribution visible on any page.
**Depends on**: none
**Size**: M

---

## Phase: URGENT — Player Tools Search Broken

**Exit Criterion**: Player search in Career Stats, Career Compare, Compare Table, Game Log, and Scoring Breakdown panels returns results for all NFL players.

### Task 1: Fix player search in Player Tools panels
**Requirement**: The search/autocomplete in Career Stats, Career Compare, Compare Table, Game Log, and Scoring Breakdown panels is completely broken — typing popular player names (e.g., "Patrick Mahomes", "Ja'Marr Chase", "Josh Allen") returns no results. Debug the search function in these panels: (1) Check what API endpoint the search hits — is it `/api/players`? Is the query parameter correct? (2) Check if the search input has the right event listener (oninput/onkeyup). (3) Check if the autocomplete dropdown renders results or silently fails. (4) Check if player name matching is case-sensitive or has encoding issues with apostrophes (Ja'Marr). (5) Test with console open to see if there are 404s or empty responses. These panels are in `lab-panels.js` — search for their render/init functions and trace the player search flow.
**Accept when**: Type "Mahomes" in any of the 5 panels → Patrick Mahomes appears in results. Type "Chase" → Ja'Marr Chase appears. Search works for all players in the database. Apostrophes and special characters handled.
**Depends on**: none
**Size**: M

---

## Phase: Move Lab Sidebar to Right Side

**Exit Criterion**: Lab sidebar (panel navigation) is on the right side of the page, not the left.

### Task 1: Move sidebar from left to right
**Requirement**: The Lab sidebar (`.lab-sidebar` in lab.html) is currently on the left side. Move it to the right side of the page. The main content (screener, panels) should be on the left, sidebar navigation on the right. Update the CSS layout — the current layout likely uses `flex` or `grid` with sidebar first; swap the order so `.lab-main` comes first (left) and `.lab-sidebar` comes second (right). Also update: (1) the collapse toggle direction (currently `«` should become `»` and vice versa), (2) mobile slide-in direction (should slide from right instead of left), (3) any absolute positioning or margin assumptions that depend on left placement.
**Accept when**: Sidebar renders on the right side on desktop. Main content fills the left. Collapse toggle works correctly. Mobile sidebar slides from right. No layout breaks.
**Depends on**: none
**Size**: M

---

## Phase: Remove CSV Button From Non-Table Panels

**Exit Criterion**: CSV export button only appears on panels that have exportable table data. Panels without tables show no CSV option.

### Task 1: Hide CSV button on panels with no table data
**Requirement**: The CSV export button appears on every panel header, but many panels don't have table data (charts, visualizations, text-based panels, dashboards). Clicking CSV on these shows "no table data to export" — pointless and confusing. Fix `exportPanelCSV()` in lab.js and the panel header template in the `switchPanel()` function (lab.html ~line 4048) to only render the CSV button if the panel actually contains a `<table>` element. Either: (a) check after the panel renders and hide the button if no table exists, or (b) maintain a list of panels that have tables and only show CSV for those. Option (a) is simpler and self-maintaining.
**Accept when**: Panels with tables show CSV button. Panels without tables (charts, dashboards, text panels) have no CSV button. No "no table data to export" toasts anywhere.
**Depends on**: none
**Size**: S

---

## Phase: URGENT — Lock Icons + Trial CTAs Still Broken

**Exit Criterion**: Pro/trial users see ZERO lock icons and ZERO "start free trial" prompts anywhere on the site.

### Task 1: Fix lock icons not disappearing for Pro/trial users
**Requirement**: Users on the free trial (effective Pro) STILL see lock icons on Pro panels in the Lab sidebar. The previous fix did not work. Debug this thoroughly: (1) Check how `isPaidUser()` is called during sidebar rendering — is it called BEFORE the JWT is decoded? If so, the user appears "free" on first render. (2) Check if the sidebar lock icons are applied in HTML statically and never removed by JS. (3) Add a `DOMContentLoaded` or `razzle-plan-changed` listener that re-evaluates all lock icons AFTER auth state is resolved. (4) Test by logging in as a trial user and confirming zero locks appear. The function `isPaidUser()` in app.js must return true for trial users — verify `_currentUser.plan` is "pro" when on trial.
**Accept when**: Log in as trial user → zero lock icons in sidebar. Log in as Pro → zero lock icons. Log out → lock icons appear on all Pro panels. This must work on page load, not just after a delay.
**Depends on**: none
**Size**: M

### Task 2: Fix "start free trial" CTA showing to trial users
**Requirement**: Users currently ON the free trial are seeing "Start your free trial" CTAs across the site. This is broken. Find every instance of trial/upgrade CTA text across all pages (index.html, pricing.html, lab.html, league-intel.html, agents.html, app.js) and make them check the user's current state before rendering. If `_currentUser.trial_active === true` or `isPaidUser() === true`, these CTAs must either: (a) disappear entirely, (b) change to "You're on Pro (X days left)" or (c) change to "Subscribe to keep Pro after trial." Search for strings like "free trial", "Start trial", "Try Pro", "Upgrade" and gate each one behind `isPaidUser()` / trial status checks.
**Accept when**: Trial user sees zero "start trial" prompts on any page. Pricing page highlights their current plan. Nav shows "Pro (trial)" badge, not "Start trial" button.
**Depends on**: none
**Size**: L

---

## Phase: Landing Page — Campaign Alignment ("Context Is The Product")

**Exit Criterion**: Landing page (index.html) tells the "context is the product" story. A first-time visitor from Twitter understands in 10 seconds: the Screener is forever free, AI without your league data is useless, Razzle fixes that.

### Task 1: Rewrite hero section
**Requirement**: The hero section needs to lead with the campaign message. Current hero is generic. New hero should follow this structure:
- **Headline**: Something punchy that communicates "AI is useless without context" — e.g., "ChatGPT doesn't know your league. Razzle does." or "Your AI advisor doesn't know you're 4-6 in a half-PPR league. Ours does."
- **Subhead**: "The Screener is forever free. The intelligence is what you pay for."
- **CTA**: "Open the Screener" (primary, links to lab.html) + "Connect your league" (secondary, links to league-intel.html)
- Keep the tiger mascot and chunky Razzle aesthetic. Luckiest Guy for headline, Caveat for subhead.
- Remove or rework any old hero copy that positions "the Lab" as the free product — it's the Screener now.
**Accept when**: Hero communicates the context problem + Razzle's solution in under 10 seconds. "Forever free" visible. Two clear CTAs. Matches DESIGN.md.
**Depends on**: none
**Size**: M

### Task 2: Strip landing page down to essentials — make it shallow
**Requirement**: The current landing page is way too crowded. Strip it down to the absolute minimum. The page should have ONLY these sections, each one short — no feature lists, no deep explanations, just vibes and CTAs:

1. **Hero** — Headline + subhead + 2 CTAs. That's it. No feature grid, no bullet lists.
2. **One visual** — A single screenshot of the Screener with real data. No explanation. Let the screenshot sell. Caption: "The Screener is forever free." CTA: "Open the Screener."
3. **One sentence about the Bureau** — "Connect your Sleeper league. See what your rivals are doing." CTA: "Connect." No feature breakdown, no panels described.
4. **One sentence about the Situation Room** — "Six AI agents that already know your league." One example briefing card (redacted/demo). CTA: "Learn more." No agent bios, no deep explanation.
5. **Pricing** — Two columns: Forever Free vs Pro. Minimal. CTA.
6. **Footer** — tagline, links.

DELETE everything else — feature grids, sprawling sections, stat showcases, multiple demo panels, agent bio grids, lengthy descriptions. If it takes more than one sentence to explain, it belongs on the product page, not the landing page. The landing page is a billboard, not a brochure. A visitor should scroll from top to bottom in under 15 seconds.
**Accept when**: Landing page is 5-6 short sections. No section is longer than a few lines + one visual. Total scroll depth is half or less of current page. Clean, spacious, fast to scan.
**Depends on**: Task 1
**Size**: L

---

## Phase: Lab Sidebar — "Forever Free" Label + Pro Extends All Categories

**Exit Criterion**: Lab sidebar has "FOREVER FREE" as the top category label. All other existing categories (Rankings & Values, Performance, Game Analysis, etc.) fall under a "PRO" parent section.

### Task 1: Rename free section to "FOREVER FREE" and restructure Pro
**Requirement**: In the Lab sidebar (lab.html), the free panels category should be labeled "FOREVER FREE" (not "Free" or "FREE"). Below it, add a "PRO" category header, and nest ALL existing subcategories (Rankings & Values, Discovery, Performance, Game Analysis, Trends & Projections, College, Player Tools, League Tools, Records & History, Teams) underneath it as sub-menus. The visual hierarchy should be:

```
FOREVER FREE
  The Screener
  Dynasty Rankings
  Tiers
  Trade Values
  Cheat Sheet
  Breakouts
  Weekly Heatmap
  Big Board
  Dashboard
  Stat Leaders

PRO
  Rankings & Values ▸
    VORP, Positional Advantage, Auction Values, ...
  Discovery ▸
    Buy/Sell, Stock Watch, Waivers, Scarcity, Handcuffs, ...
  Performance ▸
    Efficiency, Consistency, Snap Efficiency, ...
  Game Analysis ▸
    Matchups, Stacks, Red Zone, Streaks, ...
  (etc. — all existing categories stay as sub-groups under PRO)
```

"FOREVER FREE" should be always expanded, not collapsible. "PRO" categories should be collapsible as they currently are. Lock icons on Pro items for free users.
**Accept when**: "FOREVER FREE" label at top with 10 panels. "PRO" header with all other categories nested below it. Existing sub-categories preserved. Free section always expanded. Matches DESIGN.md styling.
**Depends on**: none
**Size**: M

---

## Phase: Lab Panel-by-Panel Audit (Continuous)

**Exit Criterion**: Every Lab panel matches DESIGN.md, has no broken UI, no JS errors, and renders real data correctly.

### Task 1: Audit and fix Lab panels alphabetically — batch 1 (A-D)
**Requirement**: Open each panel one by one: advantage, aging, airyards, archetypes, auction, awards, breakdown, breakouts, buysell, career, career-compare, cheatsheet, compare, comptable, consistency, correlations, dashboard, draftclass, drafttracker, drops, dualthreat. For each: (1) Does it load without JS errors? (2) Does it render real data? (3) Do colors match DESIGN.md (CSS vars only, no hardcoded hex)? (4) Are fonts correct (Space Mono for data, Luckiest Guy for titles, Caveat for annotations)? (5) Are borders 2px+ and shadows 4px offset? (6) Does mobile scroll horizontally? (7) Do player names have click handlers? Fix every issue found.
**Accept when**: All panels A-D load, render data, match design guide. Zero console errors.
**Depends on**: none
**Size**: XL

### Task 2: Audit and fix Lab panels — batch 2 (E-M)
**Requirement**: Same audit for: efficiency, explorer, fptsbreakdown, gamelog, gamescript, garbagetime, handcuffs, leaders, matchups, mockdraft, opportunity, pace, percentiles, playoffs, powerrankings, proradar.
**Accept when**: All panels E-M pass same criteria as batch 1.
**Depends on**: Task 1
**Size**: XL

### Task 3: Audit and fix Lab panels — batch 3 (R-Z)
**Requirement**: Same audit for: rankings, recap, records, redzone, reportcard, rosterbuilder, scarcity, schedule, scoring, seasonpace, snapefficiency, stacks, stocks, streaks, strengths, successrate, targetpremium, targets, tdregression, team, tiers, tradefinder, tradevalues, usage, vorp, waivers, weekly, weeklyleaders, weeklymvp, workload, yoy.
**Accept when**: All panels R-Z pass same criteria. Every single Lab panel verified.
**Depends on**: Task 2
**Size**: XL
