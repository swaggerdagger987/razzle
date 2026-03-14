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
