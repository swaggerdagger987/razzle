# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: P0 CRITICAL — Lab Panels Broken (blank pages)

**Exit Criterion**: Every Lab panel in the sidebar loads and renders content. No blank pages.

### Task 1: Fix all non-screener Lab panels returning blank pages
**Requirement**: In the Lab, clicking any sidebar panel other than The Screener shows a blank page — no content renders. This is the most critical bug on the site. The Lab is the core product and 60+ panels are completely non-functional. Debug why panels fail to render: check the `switchPanel()` function in lab.html (~line 4008), the `panelRegistry` object, the panel render functions in `lab-panels.js`, and the panel container creation logic. Common causes: panelRegistry not populated, render functions failing silently, missing API data, JS errors preventing execution. Fix ALL panels so they load and display data.
**Accept when**: Click every sidebar category — at minimum spot-check 10 panels across different categories (rankings, breakouts, weekly, efficiency, aging, prospects, career, matchups, dashboard, leaders). All render content. No blank pages. No console errors.
**Depends on**: none
**Size**: L

---

## Phase: P0 Launch Blockers (must fix before Monday)

**Exit Criterion**: All four P0 issues from the 2026-03-14 gstack review are resolved. No page crashes, no broken layouts, no wrong design tokens.

### Task 1: Fix Situation Room — unclosed div tags
**Requirement**: agents.html has ~50 unclosed `</div>` tags causing the entire page layout to collapse. This is the root cause of the Situation Room being broken. Systematically audit every `<div>` open/close pair in agents.html and fix all mismatches. The page has a hero section (sand bg), a dark zone (warroom-dark with canvas, status bar, scenario panel, briefing cards, config panel), and the page must render correctly end-to-end.
**Accept when**: agents.html passes HTML validation with zero unclosed div errors. Page loads cleanly — hero renders, dark zone renders, canvas visible, scenario panel usable, briefing cards display. No console errors.
**Depends on**: none
**Size**: M

### Task 2: Fix server crash — infinite recursion on missing X-Forwarded-For
**Requirement**: `backend/server.py` line ~68 has an infinite recursion bug when a request lacks the X-Forwarded-For header. This will crash the server on the first request in any environment without a reverse proxy. Add a fallback to `request.client.host` or `"unknown"` when the header is missing.
**Accept when**: Server starts and handles requests without X-Forwarded-For header. No recursion error. Run `python -m pytest tests/ -v` to verify no regressions.
**Depends on**: none
**Size**: S

### Task 3: Fix --ink-light CSS variable
**Requirement**: In `frontend/styles.css` line ~25, `--ink-light` is set to `#6d5c4e` but DESIGN.md specifies `#8a7565`. Update to match the design guide.
**Accept when**: `--ink-light: #8a7565` in styles.css. Grep confirms no other definition of --ink-light with the wrong value.
**Depends on**: none
**Size**: S

---

## Phase: Bureau of Intelligence — Center Alignment

**Exit Criterion**: Bureau of Intelligence page content is horizontally centered, not right-aligned.

### Task 1: Fix right-aligned layout to center
**Requirement**: `.intel-container` has `margin: 0 0 0 auto` pushing all content to the right. Change to `margin: 0 auto` to center. Also fix `.connect-card` which has `margin: 40px 0 40px auto` — change to `margin: 40px auto`. Audit the rest of league-intel.html for any other right-aligned margins that should be centered.
**Accept when**: All Bureau content is horizontally centered on desktop and mobile. No layout regressions.
**Depends on**: none
**Size**: S

---

## Phase: Lab Tier Gating + Sidebar Reorganization

**Exit Criterion**: Lab sidebar is reorganized so free panels appear first. Free users can access a curated set of high-value panels. Pro-locked panels show lock icons and upgrade prompts. Sidebar order reflects tier hierarchy.

### Task 1: Reorganize Lab sidebar — free panels on top
**Requirement**: Reorder the sidebar in lab.html so all free-tier panels appear at the top under a "Free" or unlabeled section, followed by Pro-locked panels. Current sidebar categories (Rankings & Values, Discovery, Performance, etc.) should be restructured so free panels come first within a clear visual hierarchy. The new sidebar order should be:

**FREE panels (top of sidebar):**
- The Screener (already default/active)
- Dynasty Rankings
- Tiers
- Trade Values
- Cheat Sheet
- Breakouts
- Weekly Heatmap
- Big Board (prospects)
- Dashboard
- Stat Leaders

**PRO panels (below, with lock icons):**
Everything else — VORP, Positional Advantage, Auction Values, Buy/Sell, Stock Watch, Waivers, Scarcity, Handcuffs, Efficiency, Consistency, Snap Efficiency, Workload Monitor, Dual-Threat, Target Premium, Drop Rate, Garbage Time, Success Rate, Correlations, Matchups, Stacks, Red Zone, Streaks, Weekly Leaders, Weekly MVP Grid, Playoffs, Game Script, Usage Trends, Year-over-Year, Aging Curves, Player Pace, Season Pace, TD Regression, Air Yards, Draft Class Analytics, Percentiles, Mock Draft, Athletic Radar, Draft Class Tracker, Career Stats, Career Compare, Compare Table, Strengths, Report Card, Points Breakdown, Game Log, Archetypes, Scoring Breakdown, Roster Builder, Trade Finder, Scoring Comparison, Schedule/SOS, Opportunity Share, Records, Season Recap, Awards, Explorer, Target Distribution, Team Rosters, Power Rankings.

Group free panels under a sidebar category header like "FREE" or keep them ungrouped at top. Pro panels keep their existing category groupings but each item gets a lock icon suffix.
**Accept when**: Free panels appear first in sidebar. Visual separation between free and pro sections. Sidebar order matches the list above.
**Depends on**: none
**Size**: M

### Task 2: Gate Pro panels in switchPanel()
**Requirement**: Modify the `switchPanel()` function in lab.html (~line 4008) to check `isPaidUser()` before rendering any non-free panel. Define a `FREE_PANELS` set: `['screener', 'rankings', 'tiers', 'tradevalues', 'cheatsheet', 'breakouts', 'weekly', 'prospects', 'dashboard', 'leaders']`. If the panel is not in FREE_PANELS and `isPaidUser()` returns false, show an upgrade prompt overlay instead of the panel content. The overlay should match Razzle's chunky style — Luckiest Guy heading, Caveat subtext, orange CTA button linking to pricing.html. The screener's existing column-level gating (PRO_LOCKED_COLUMNS, ELITE_LOCKED_COLUMNS in lab.js) remains unchanged.
**Accept when**: Free users can access only the 10 free panels. Clicking a Pro panel shows a styled upgrade CTA. Pro/Elite users see all panels. No regressions.
**Depends on**: Task 1
**Size**: M

### Task 3: Add lock icons to Pro sidebar items for free users
**Requirement**: For free-tier users, append a small lock icon (Unicode &#x1F512; or CSS pseudo-element) to every non-free sidebar item. Add slight opacity (0.7) to locked items. Lock icons should disappear when user upgrades to Pro/Elite. Check tier on page load and on `razzle-plan-changed` event. Do NOT add lock icons for Pro/Elite users.
**Accept when**: Free users see lock icons on ~60 sidebar items. Pro/Elite users see no locks. Icons disappear on plan upgrade without page reload.
**Depends on**: Task 2
**Size**: S

---

## Phase: Lab Screener — Remove Large Page Sizes

**Exit Criterion**: Screener pagination only offers 25 rows per page. No 50/100/200 options.

### Task 1: Remove 50/100/200 page size options
**Requirement**: In lab.html, the page size dropdown (`#pageSizeSelect`, ~line 3258) offers 25/50/100/200 rows per page. Remove the 50, 100, and 200 options — keep only 25. Also remove or simplify the `changePageSize()` function in lab.js if it has logic for those values. Hardcode page size to 25 if simpler. The load times get too slow with larger page sizes.
**Accept when**: Only 25 rows per page. No dropdown options for 50/100/200. No regressions to pagination (prev/next, page count display).
**Depends on**: none
**Size**: S

---

## Phase: Lab Toolbar Redesign — Declutter + Settings Panel

**Exit Criterion**: Screener toolbar is clean, intuitive, and works on mobile. Power-user display toggles live in a collapsible settings panel. Primary actions are instantly findable. Mobile toolbar doesn't overflow or require 4 rows of buttons.

### Task 1: Create a Settings/Display panel for toggle buttons
**Requirement**: The screener toolbar currently has 30+ buttons in a flat row — completely unusable, especially on mobile. Move all display/visualization toggles into a collapsible "Display" or gear icon (⚙) settings panel that opens as a dropdown or slide-out. The following buttons should move OUT of the main toolbar and INTO the settings panel:
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

The settings panel should use chunky toggle switches or checkboxes, grouped logically (e.g. "Data Display" for Pctl/Bars/Top3/Diff, "Table Layout" for Dense/Groups/Tiers/Summary, "Color" for Heat/Heat Map). Panel opens from a single ⚙ button in the toolbar.
**Accept when**: Main toolbar has ~15 or fewer primary buttons. Settings panel contains all display toggles. All toggles still work. Keyboard shortcuts (H, R, B, L, I, T, D, G, A) still work.
**Depends on**: none
**Size**: L

### Task 2: Reorganize remaining toolbar into logical groups
**Requirement**: After moving toggles to settings, reorganize the remaining toolbar buttons into clear groups with visual separators:

**Row 1 — Core controls**: Position chips (ALL/QB/RB/WR/TE) | Search | Season | ⚙ Settings
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
