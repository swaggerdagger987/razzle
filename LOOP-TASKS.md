# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 52 (Screener Player Notes)
## Phase 52: Screener Player Notes
**Exit Criterion**: Users can add personal text notes to any player in the NFL screener. Notes appear in an optional "Notes" column. Notes visible in hover cards. Notes persist in localStorage. Notes editable inline via click. Hidden in non-NFL modes.

- Task 1: PASS
- Task 2: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Notes data model + inline editing UI
**Status**: PASS
**Attempts**: 1
**Acceptance**: Clicking a notes cell in the screener opens an inline text input popup where users can type a note (max 140 chars). Notes stored as {playerId: "note text"} in localStorage under 'razzle_player_notes'. Notes appear as a toggleable "Notes" column in the screener table. Empty notes show a faint pencil icon on hover. Existing notes show truncated text. Notes persist across page refresh.
**Result**: Added notes data layer (getPlayerNotes/savePlayerNotes/setPlayerNote with localStorage cache), note-editor-popup with textarea (140 char max), Caveat handwriting font for note text, pencil icon on empty cells, truncated text on filled cells, chunky design-system popup.

### Task 2: Notes in hover card + keyboard shortcut
**Status**: PASS
**Attempts**: 1
**Acceptance**: Player hover cards show the note text (if any) below the stats. Pressing 'N' toggles notes column. Notes column available in column picker under "Notes" group. Clear note by emptying the text.
**Result**: Hover card shows note with pencil icon and dashed separator. N key toggles notes column visibility. Notes column in COLUMNS with group "Notes". Clear button in editor. Shortcut added to keyboard hint strip and ? reference overlay.
