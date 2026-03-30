# DES-059: league-intel.html has 6 remaining sub-minimum border-radius on bar elements

**Priority**: P1
**Area**: frontend/league-intel.html (Bureau — conversion engine)
**Cycle**: 6

## Problem

DES-048 fixed sub-minimum border-radius on league-intel.html but missed 6 instances on progress bar and stacked bar elements. The Bureau is the conversion engine — these bars appear in Pressure Map, Roster Depth, and Waiver Tendencies sections that Pro users see.

## Instances Found

| Line | Selector | Current | Should Be |
|------|----------|---------|-----------|
| 443 | `.pressure-bar-track` | 3px | var(--radius-sm) (8px) |
| 449 | `.pressure-bar-fill` | 2px | 6px (inner fill) |
| 842 | `.depth-bar-track` | 4px | var(--radius-sm) (8px) |
| 1380 | `.waiver-pos-bar` | 3px | var(--radius-sm) (8px) |
| 1389 | `.waiver-faab-bar` | 3px | var(--radius-sm) (8px) |
| 5641 | JS inline stacked bar | 4px | var(--radius-sm) (8px) |

## Fix

1. Change bar track containers to `border-radius: var(--radius-sm)` (8px)
2. Change inner bar fills to `border-radius: 6px` (fits inside 8px track)
3. Update JS inline style at line 5641 to match

## Why This Matters

Bureau Pressure Map and Roster Depth are the "I need this" conversion moments. Bar chart inconsistency at 3px radius vs 8px everywhere else signals unfinished product to the dynasty power users who notice everything.

## Design Rule

DESIGN.md: `--radius-sm: 8px` minimum. DES-048 was supposed to catch all of these.
