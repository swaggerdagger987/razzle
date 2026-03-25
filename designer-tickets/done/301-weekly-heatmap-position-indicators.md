<!-- PM: ready -->
---
id: DES-344
priority: P3
area: weekly.html
section: player column
type: visual / readability
status: open
---

# Weekly heatmap position dots are 8px — too small for quick position scanning in a dense grid

## What's wrong

The weekly scoring heatmap uses 8x8px colored dots as the only position indicator per player row. In a table with 17 week columns + player name + GP + AVG, the tiny dot is easy to miss when scanning vertically to find "all WR rows" or "all QB rows."

The position filter tabs at the top help, but when viewing "All" positions together, visual grouping by position is lost. Other Razzle pages (breakouts, dashboard, tiers) use larger position badges or colored left borders that are instantly scannable.

## Where

`frontend/weekly.html`:
- `.player-pos-dot`: lines 191-197, 8x8px circle, 2px solid ink border
- Position colors applied at line 521-527

## Evidence

Screenshot: weekly-desktop.png — the heatmap is a dense 50-row x 20-column grid. Position dots are barely visible between the player name and the colored data cells. Compare to the Lab screener where position badges are 24px+ with text labels.

## Suggested fix

1. Add a 3px position-colored left border to each player row (like the tiers page tier labels) — this creates instant visual lanes
2. Or increase dot size from 8px to 12px
3. Or add a 2-letter position text label (QB, RB, WR, TE) next to the player name in the position color

Any of these would make position identification instant instead of requiring per-row inspection.

## Why this matters

Weekly scoring heatmaps are a staple dynasty screenshot. Position-color scanning helps users quickly compare "all my WRs" vs "all my RBs" performance across weeks. The current 8px dot doesn't support that workflow.
