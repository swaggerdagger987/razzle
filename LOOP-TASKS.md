# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 49 (Player Hover Cards)
## Phase 49: Player Hover Cards — Mini Profile on Hover
**Exit Criterion**: Hovering over a player name in the NFL screener table for 300ms shows a compact hover card with: headshot, position badge, team, age, PPG, fantasy points total, DVS, and the weekly sparkline. Card dismisses on mouse leave. Card positioned near cursor (no overflow off-screen). No blocking fetches. Works on desktop only. No console errors.

- Task 1: PASS
- Task 2: PASS
- Stage: COMPLETE
- Next: Phase gate (Phase 50 = QA+UX audit)

### Task 1: Player hover card component (CSS + HTML + JS)
**Status**: PASS
**Attempts**: 1
**Acceptance**: A reusable showHoverCard/hideHoverCard function pair. Hover card is a fixed-position div styled per DESIGN.md: bg-card, 3px ink border, 4px box-shadow, 12px radius. Shows headshot, name, pos badge, meta, stats (PPG/FPTS/DVS), sparkline. 300ms delay. Animate in. Viewport clamped.
**Result**: Added #playerHoverCard div, CSS with .hover-card/.visible classes, animation (opacity+translateY), @media hidden on mobile. JS: showHoverCard reads from state.items (no API call), builds headshot + stats + sparkline from _sparklineCache. hideHoverCard clears timer and removes class. onPlayerNameEnter/Leave with 300ms debounce.

### Task 2: Wire hover cards to screener table player names
**Status**: PASS
**Attempts**: 1
**Acceptance**: Player name links in buildRowHTML (NFL mode) trigger onPlayerNameEnter on mouseenter and onPlayerNameLeave on mouseleave. No interference with click-to-profile. College/prospect rows excluded.
**Result**: Added onmouseenter/onmouseleave to NFL player name <a> tags in buildRowHTML. hideHoverCard called at start of openPlayerProfile to dismiss card before modal opens. Virtual scroll compatible (inline event handlers in HTML string).
