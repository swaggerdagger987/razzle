---
id: DQ-260
title: Standalone page table rows lack cursor:pointer — clickable rows don't look clickable
priority: P2
category: interaction / discoverability
status: open
cycle: 35
---

## Problem

Many standalone pages (tradevalues, rankings, breakouts, buysell, stocks, etc.) have table rows that are clickable (opening player profiles or triggering actions). But these rows don't have `cursor: pointer`, so users don't know they can click.

The Lab screener table has cursor pointer on interactive elements, but standalone pages built later don't follow the same pattern.

## Evidence

Spot-checked 6 standalone pages:
- `tradevalues.html`: rows have `onclick` but no `cursor: pointer`
- `rankings.html`: player chips are clickable but no pointer cursor
- `breakouts.html`: rows expand on click, no pointer cursor
- `buysell.html`: rows are clickable, no pointer cursor

## Fix

Add to `frontend/styles.css`:
```css
.data-table tbody tr[onclick],
.data-table tbody tr[data-clickable],
.player-chip {
  cursor: pointer;
}
```

Or add to each standalone page's `<style>` block:
```css
tbody tr { cursor: pointer; }
```

The CSS-class approach is cleaner if all standalone tables use `.data-table`.

## Files
- `frontend/styles.css` — add 1 rule, OR
- 20+ standalone HTML files — add cursor rule to their `<style>` blocks

## Impact
Discoverability. Users don't click what they don't know is clickable.
