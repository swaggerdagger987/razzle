# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## PRIORITY 1: Expand Data to 2015-2025 + Full College Stats
**THIS IS THE HIGHEST PRIORITY TICKET. DO THIS BEFORE ANYTHING ELSE.**

**Exit Criterion**: terminal.db contains NFL player data for ALL seasons 2015-2025 (not just 2024). College football stats (cfb_player_season_stats) cover all available years. All adapters (nflverse_adapter.py, college_adapter.py) are run for the full date range. The database is rebuilt locally with the complete dataset. After rebuild, upload the new terminal.db to the GitHub release: `gh release upload data-v1 data/terminal.db --clobber --repo swaggerdagger987/razzle`. Commit and push all adapter changes.

**Tasks**:
1. Update nflverse_adapter.py to sync seasons 2015-2025 (not just 2024). Run it to populate terminal.db with full historical data.
2. Update college_adapter.py to sync all available college seasons. Run it to populate cfb_player_season_stats with full historical data.
3. Run any other adapters (combine_data, draft_picks) for full historical range if not already complete.
4. Verify row counts — players, player_week_stats, player_week_metrics, cfb_player_season_stats should all have significantly more data than before.
5. Upload the rebuilt terminal.db: `gh release upload data-v1 data/terminal.db --clobber --repo swaggerdagger987/razzle`

---

## Backend Cleanup: Fix Duplicate Routes + Shared Utils
**Exit Criterion**: Duplicate route definitions for `aging_curves` and `td_regression` in server.py are removed (keep one each). `normalize_name()` is extracted to a shared `utils.py` and imported by all 3 adapters instead of duplicated. Fix Turso push script to use `executemany()` for batch inserts instead of row-by-row.

## Backend Cleanup: Add Structured Logging
**Exit Criterion**: Replace bare `except Exception` blocks with proper logging using Python's `logging` module. Add request logging middleware (method, path, status, duration). Log all errors with stack traces. Structured JSON format for production. Console format for local dev. No silent failures anywhere in the backend.
