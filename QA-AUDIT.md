# QA + UX Audit — Phases 121-124

**Date**: 2026-03-11
**Phases audited**: 121 (Undo/Redo), 122 (Stat Leaders), 123 (Column Stats Popover), 124 (Interactive Data Cells)
**Files reviewed**: frontend/lab.js (+394 lines), frontend/lab.html (+44 lines)

---

## QA FINDINGS

### CRITICAL — None

### HIGH

**H1. Column stats popover not dismissed on table scroll**
- **File**: frontend/lab.js, `showColumnStatsPopover()`
- **What**: The popover is `position:fixed` and stays in place when the user scrolls the table horizontally or vertically. The header scrolls away but the popover remains floating over unrelated content.
- **Fix**: Add a scroll listener on `.table-wrap` that calls `dismissColumnStatsPopover()`.

**H2. Escape key conflict in column stats popover**
- **File**: frontend/lab.js, `_colStatsEscDismiss()`
- **What**: Pressing Escape dismisses the popover but doesn't `stopPropagation()`, so it also triggers the global Escape handler (which clears row highlights). Two actions fire from one keypress.
- **Fix**: Add `e.stopPropagation()` in `_colStatsEscDismiss` when popover is visible.

### MEDIUM

**M1. Duplicate filters possible via double-click**
- **File**: frontend/lab.js, dblclick handler
- **What**: Double-clicking the same stat cell multiple times adds the same filter repeatedly. No dedup check.
- **Fix**: Before pushing the filter, check if `state.filters` already has a matching key+op+value.

**M2. Leader badge cache key too weak**
- **File**: frontend/lab.js, `computeLeaderRanks()`
- **What**: Cache key is `items.length + first_id + last_id`. Could produce false cache hits when switching seasons with identical player counts.
- **Fix**: Add `state.sortKey + state.season` to the cache key.

### LOW

**L1. Leader dots add ~9px extra width to cells** — No action needed, minimal jitter.
**L2. Undo/Redo doesn't capture visual mode state** — Intentional, visual modes are separate from data state.

---

## UX FINDINGS

### CRITICAL — None

### HIGH — None

### MEDIUM

**UX-M1. "Leaders" button label ambiguous**
- **File**: frontend/lab.html, toolbar
- **What**: "Leaders" could mean leaderboard, team leaders, etc. Other toggle buttons (Heat, Pctl, Bars) are clearer.
- **Fix**: Rename to "Top 3" for immediate clarity.

### LOW

**UX-L1. No discoverability for double-click filter** — Power-user feature, add to shortcuts modal.
**UX-L2. Column stats popover doesn't show position context** — Add position label to popover.
