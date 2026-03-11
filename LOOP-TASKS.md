# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 51 (Screener Player Tags)
## Phase 51: Screener Player Tags
**Exit Criterion**: Users can color-tag players in the NFL screener with labels (BUY, SELL, WATCH, TARGET, AVOID). Tags appear as colored chips next to player names. Tags persist in localStorage. A "Tagged" filter shows only tagged players. Tags survive pagination and refresh.

- Task 1: PASS
- Task 2: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Tag data model + UI interaction
**Status**: PASS
**Attempts**: 1
**Acceptance**: Clicking a tag icon next to a player name opens a small tag picker popup with 5 options (BUY=green, SELL=red, WATCH=yellow, TARGET=blue, AVOID=purple). Selecting a tag stores {playerId: tagName} in localStorage under 'razzle_player_tags'. Clicking the same tag again removes it. Tag chips (colored pill badges) appear next to the player name in the table. Tags persist across page refresh.
**Result**: Added TAG_OPTIONS with 5 colored tags, localStorage-backed cache (razzle_player_tags), tag picker popup with chunky design-system styling, buildTagChip() for inline pill badges, tag dot icon on row hover.

### Task 2: Screener tag filter + clear all
**Status**: PASS
**Attempts**: 1
**Acceptance**: A "Tagged" button in the filter/toolbar area filters the screener to show only tagged players. When active, shows count badge. "Clear All Tags" option in tag picker dropdown. Tags visible on hover card. Tag state included in URL params for shareability.
**Result**: Tags button in toolbar with toggleTagFilter(). Badge shows count, highlights orange when active. Right-click Tags button to clear all. Tags shown in hover card name. tagged=1 URL param. Hidden in non-NFL modes.
