# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 117 (CSV Export)
## Phase 117: CSV Export
**Exit Criterion**: Click "Export CSV" button in Lab toolbar → downloads CSV of current filtered/sorted view with all visible columns. Filename includes position and date.

- Task 1: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: CSV export button and download logic
**Status**: PASS
**Attempts**: 1
**Result**: Added "CSV" btn-chunky button to toolbar (between Trade and Share). Uses existing exportCSV() which handles all three universes, visible columns only, proper CSV escaping. Filename updated to include date: razzle-export-{pos}-{season}-{YYYY-MM-DD}.csv. 34 tests pass.
