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
**Size**: L

### Task 2: Reorganize remaining toolbar into logical groups
**Size**: L

### Task 3: Mobile toolbar — touch-friendly and compact
**Size**: M

---

## Phase: Brand Copy Update — "The Screener is Forever Free"

**Exit Criterion**: All frontend copy reflects the updated brand positioning.

### Task 1: Update landing page copy
**Size**: M

### Task 2: Update pricing page copy
**Size**: M

### Task 3: Update about page and any remaining copy
**Size**: S

---

## Phase: Universal Player Click — Consistent Popup Across All Pages

**Exit Criterion**: Clicking a player name on any page/panel opens the same player detail popup as the screener.

### Task 1: Extract player popup into shared component
**Size**: L

---

## Phase: Big Board — UI Overhaul

**Exit Criterion**: Big Board (prospects panel) looks polished and matches Razzle design guide. No raw/broken UI elements.

### Task 1: Audit and fix Big Board UI
**Size**: L

---

## Phase: Monte Carlo League Odds — Bureau Feature

**Exit Criterion**: Connected Sleeper leagues show live championship/playoff odds for every manager.

### Task 1: Backend — projection distribution builder
**Size**: L

### Task 2: Frontend — Monte Carlo simulation engine
**Size**: L

### Task 3: UI — Summary odds cards (FREE tier)
**Size**: M

### Task 4: UI — Deep-dive panel (PRO tier)
**Size**: XL
