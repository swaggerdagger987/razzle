# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 54 (Screener Tier Breaks)
## Phase 54: Screener Tier Breaks
**Exit Criterion**: When sorted by any stat column, the NFL screener shows visual tier break dividers between player groups. Tier 1 (elite), Tier 2, Tier 3, etc. with labeled separator rows. T key toggles tier breaks on/off. Tier sizes follow positional defaults (QB: 1/12/24, RB/WR: 1/12/24/36, TE: 1/12). Tier breaks hidden in college/prospect modes. State persists in localStorage.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Tier break dividers with toggle and persistence
**Status**: PASS
**Attempts**: 1
**Acceptance**: Clicking pin icon in a row pins the player to a sticky tbody above the main table body. Pinned rows have cream background (var(--bg-card)), separated by 3px dashed orange border. Pin icon is orange when pinned, faint on hover when not. Max 5 pins. Pins persist in localStorage (razzle_pinned_players). Pins in URL params (?pins=id1,id2). P key clears all pins. Pin column header shows pin count with click-to-clear. Hidden in college/prospect modes.
**Result**: Added tierBreaks state (localStorage-backed), insertTierBreakRows/buildTierBreakRow functions with TIER_BREAK_SIZES [5,12,24,36], Caveat font tier labels with terracotta left border, T keyboard shortcut, tierBreaksBtn toolbar button with active state, URL ?tiers=1 serialization, hidden in college/prospect modes, pinned rows excluded from tier counting.
