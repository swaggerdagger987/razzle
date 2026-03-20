# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Hotfix — Global data font consistency

**PRIORITY: FIX NOW.** All data-level text across the entire site must use Space Mono (`var(--font-mono)`). This includes: player names, stat values, table cells, position badges, team labels, score numbers, ranking numbers, trade values, percentages, column headers in tables, filter chips, dropdown options, search results, compare tables, profile stats, and any text that displays player/stat/league information. Luckiest Guy stays for page headings and section titles ONLY. Caveat stays for annotations and loading states ONLY. Everything else = Space Mono. If it's data, it's mono.

### Task 1-5: Audit all font-family across all files
**Status**: DONE — Prior font overhaul (Phases 496-514, 648-651, 801-802 in PROGRESS.md) fixed 500+ violations. Verified: all remaining font-display uses are on headings/titles/grades at 16px+. Zero data elements use display font.

---

## Phase: Hotfix — Sidebar restructure: Forever Free = Screener only, free panels as subheading

**PRIORITY: FIX NOW.** The sidebar currently labels too many things as "Forever Free." The ONLY forever free feature is the Screener itself. The free panels (Dynasty Rankings, Tiers, Trade Values, Cheat Sheet, Breakouts, Weekly Heatmap, Big Board, Dashboard, Stat Leaders) should be grouped under a separate subheading called **"FREE PANELS"** — still accessible without login, but visually distinct from the Screener which is THE forever free product. The Pro panels stay under "PRO" as they are now.

### Task 1: Restructure sidebar labels and grouping
**Accept when**: The Lab sidebar has this structure:
- **FOREVER FREE** section contains ONLY "The Screener"
- **FREE PANELS** section (new subheading, below Forever Free) contains: Dynasty Rankings, Tiers, Trade Values, Cheat Sheet, Breakouts, Weekly Heatmap, Big Board, Dashboard, Stat Leaders
- **PRO** section stays as-is with all the paid panels
- The "FOREVER FREE" label is visually prominent (terracotta/orange color, Luckiest Guy font)
- The "FREE PANELS" label is styled slightly different — still free, but clearly a separate grouping (maybe ink-light color, smaller)
- The "PRO" label stays as-is
- Update lab.html sidebar HTML and any JS that renders/manages sidebar categories
- All functionality unchanged — just the visual grouping and labels
**Status**: DONE

---

## Phase: Hotfix — Repopulate player headshot URLs

**PRIORITY: FIX NOW.** All player headshot_url values are NULL in the database. The headshots come from nflverse roster CSVs. Run `sync_rosters()` from the nflverse adapter to re-populate headshot_url for all players. This is a data fix, not a code fix.

### Task 1: Run roster sync to repopulate headshot URLs
**Accept when**: Run the nflverse `sync_rosters()` function against the local terminal.db for all seasons 2015-2025. After sync, verify with `SELECT COUNT(*) FROM players WHERE headshot_url IS NOT NULL AND headshot_url != ''` — should be 1500+ (all active/recent players with ESPN/nflverse headshot URLs). Verify star players have URLs: Mahomes, Allen, Jefferson, Chase, etc. Commit the repopulated database state by noting in PROGRESS.md that headshots were re-synced. NOTE: After this fix, the user needs to manually upload the updated terminal.db to the Render persistent disk at /data/terminal.db.
**Status**: DONE

---

## Phase: Hotfix — Welcome to Pro page after checkout

**PRIORITY: BUILD NOW.** After a user completes Stripe checkout and lands back on razzle.lol, there's no celebration, no onboarding, no acknowledgment that they just paid. They need a "Welcome to Pro" moment. This is the first impression of being a paying customer — make it count. Razzle personality, not corporate.

### Task 1: Create post-checkout welcome experience
**Accept when**: After Stripe checkout completes (user lands on the success URL, currently `agents?session_id=...`), the user sees a welcome modal or dedicated welcome page with:
- A big Razzle-flavored headline: "welcome to the film room." or "the tiger sees you now." — something warm, not corporate
- Summary of what they just unlocked (Pro features: full Bureau deep-dive, CSV export, unlimited formulas, cloud sync, etc.)
- Clear CTA buttons: "Open the Bureau" and "Back to the Lab"
- Confetti or a subtle micro-celebration animation (CSS-only, no library) — sticker/badge aesthetic
- Their plan name and billing cycle shown ("Pro — $9.99/month" or "Pro — $79.99/year")
- Uses Razzle design language: sand background, chunky borders, Luckiest Guy heading, Space Mono details, Caveat aside ("you just made the tiger very happy")
- Works for both Pro and Elite tiers with appropriate messaging
- The welcome only shows ONCE per checkout (use sessionStorage or URL param to prevent re-showing on refresh)
**Status**: DONE

---

## Phase: Weekly Data Filter — Screener + All Panels

**Context**: The `player_week_stats` table already has per-week data (40+ stat columns, every player, every week, 2015-2025). Several endpoints already support week params (`/api/weekly-leaders`, `/api/players/{id}/weeks`). But the main screener and most analytical panels only show season-aggregated data. This phase adds a universal week selector so users can slice any view by individual week — critical for in-season use.

**Exit criterion**: The screener and all applicable Lab panels have a week selector. Default is "All Weeks" (season aggregate, current behavior). Selecting a specific week (1-18) shows that week's stats only. The selector persists across panel switches and is included in shareable URLs.

### Task 1: Backend — Add week parameter to screener query endpoint
**Accept when**: `POST /api/screener/query` (or `GET /api/players`) accepts an optional `week` parameter (integer, 0 = all weeks). When `week > 0`, the query reads from `player_week_stats` (that specific week's row) instead of the season-aggregated `player_stats` table. When `week = 0` or omitted, behavior is unchanged (season totals). All stat columns that exist in both tables work correctly. Columns that only exist at season level (like career stats, dynasty values) gracefully show "—" in weekly mode. Verify by hitting the endpoint with `week=1` and confirming you get Week 1 stats only.
**Status**: DONE

### Task 2: Frontend — Add week selector to the screener toolbar
**Accept when**: The Lab screener toolbar has a week dropdown next to the existing season selector. Options: "All Weeks" (default), "Week 1" through "Week 18" (dynamically populated based on what weeks exist in the selected season — query `SELECT DISTINCT week FROM player_week_stats WHERE season = ?`). Selecting a week triggers a re-fetch with the `week` parameter. The dropdown matches the existing toolbar design (chunky Razzle style, same height/font as season selector). Week selection is stored in `state.week` and serialized to URL params (`&week=5`). Shared URLs preserve week selection.
**Status**: DONE

### Task 3: Backend — Add week parameter to all applicable panel endpoints
**Accept when**: The following endpoints accept an optional `week` parameter and filter `player_week_stats` by week when provided: `/api/breakouts`, `/api/efficiency`, `/api/consistency`, `/api/usage-trends`, `/api/target-distribution`, `/api/red-zone`, `/api/opportunity-share`, `/api/snap-efficiency`, `/api/workload`, `/api/dual-threat`, `/api/target-premium`, `/api/drop-rate`, `/api/success-rate`, `/api/gamescript`, `/api/garbage-time`, `/api/streaks`, `/api/report-cards`. Endpoints where weekly doesn't make sense (aging curves, dynasty rankings, trade values, prospect data, YoY comparisons) are left unchanged. Each modified endpoint returns single-week data when `week` is specified, season aggregate when omitted.
**Status**: DONE

### Task 4: Frontend — Add week selector to all applicable Lab panels
**Accept when**: Every Lab panel whose endpoint now supports weekly filtering gets the same week selector UI. Use a shared `renderWeekSelector(containerId, season, onWeekChange)` helper to keep the UI identical across panels. The week selector appears below the season selector in each panel's controls area. Default is "All Weeks". Selecting a week re-fetches that panel's data with the week param. Panels where weekly doesn't apply (aging curves, dynasty rankings, trade values, prospects, big board, YoY) do NOT get a week selector.
**Status**: DONE

### Task 5: Screener column headers — indicate weekly vs season context
**Accept when**: When a specific week is selected (not "All Weeks"), the screener shows a subtle indicator — e.g., a Caveat-font annotation below the toolbar saying "showing Week 5, 2025 stats" or a small badge on the week dropdown. This prevents confusion where a user sees low numbers and forgets they're looking at a single week instead of season totals. Matches Razzle design language (Caveat, slightly rotated, annotation style).
**Status**: DONE
