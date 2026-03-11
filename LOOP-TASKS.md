# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 60 (Screener Context Menu)
## Phase 60: Screener Context Menu
**Exit Criterion**: Right-clicking a player row in the screener shows a context menu with quick actions: View Profile, Add/Remove from Compare, Add/Remove from Watchlist, Pin/Unpin (NFL only), Toggle Highlight, Copy Name. Menu styled per DESIGN.md (chunky border, box-shadow, sand bg). Viewport-clamped positioning. Dismisses on click elsewhere.

- Task 1: PASS
- Stage: COMPLETE
- Next: QA + UX audit (Phase 60 is multiple of 5)

### Task 1: Context menu with quick actions
**Status**: PASS
**Attempts**: 1
**Acceptance**: Right-click on tbody row shows menu. Menu has 6 actions for NFL (profile, compare, watchlist, pin, highlight, copy name) and 4 for college (compare, watchlist, highlight, copy name). Icons for each action. Dynamic labels based on current state (pinned/unpinned, starred/unstarred, selected/unselected). Menu dismissed on click elsewhere. Viewport-clamped. DESIGN.md styled (3px border, box-shadow, border-radius).
**Result**: Added hideContextMenu(), contextmenu event listener on screenerTable, .screener-context-menu CSS, dynamic menu items based on player state and universe mode.
