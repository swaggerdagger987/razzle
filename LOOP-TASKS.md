# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 73 (Screener Copy Table to Clipboard)
## Phase 73: Screener Copy Table to Clipboard
**Exit Criterion**: Button in share modal copies current visible table data as tab-separated values to clipboard. Pastes cleanly into Google Sheets/Excel. Includes headers and rank numbers. Works in all modes.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Copy table to clipboard as TSV
**Status**: PASS
**Attempts**: 1
**Result**: Added copyTableToClipboard() function that builds TSV (tab-separated) with rank, player, pos, team, and all visible stat columns. Includes formatted percentages. Button added to share modal "Copy to Clipboard". Shows toast with row count.
