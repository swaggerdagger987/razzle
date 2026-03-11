# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---



## Phase: UX Consistency & Features (Priority 3)

**Goal**: Make ranking/value panels consistent and add missing features.

### Task 1: Add player search to VORP panel
**Bug**: BUG-007
**Problem**: No way to search for specific players in VORP
**Accept when**: VORP panel has a search bar matching Trade Values design pattern.

### Task 2: Standardize all ranking/value panel layouts
**Bug**: BUG-008
**Problem**: Dynasty Rankings, Trade Values, VORP, Tiers all look different
**Design**: Every ranking panel should have: (1) position filter chips at top, (2) search bar, (3) sortable table with consistent column widths, (4) same card/container styling from `docs/DESIGN.md`
**Accept when**: All ranking panels share the same visual structure.

### Task 3: Add adjustable formula to Trade Values
**Bug**: BUG-006
**Problem**: Trade values are static with no way to adjust weights
**Design**: Add weight sliders or inputs (age weight, production weight, positional adjustment) that recalculate values live.
**Accept when**: User can adjust at least 3 formula weights and see trade values update in real time.

### Task 4: Add historical dynasty valuations
**Bug**: BUG-004
**Problem**: No end-of-season dynasty value snapshots
**Design**: Similar to how Tiers shows per-year tiers, Dynasty Rankings should show how a player's dynasty value changed year-over-year.
**Accept when**: Dynasty Rankings panel has a historical view showing value progression per player across seasons.

---
