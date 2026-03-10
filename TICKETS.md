# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## PRIORITY 1: Lab QA — Fix Data Loading, Year Bugs, and Reliability
**THIS IS THE HIGHEST PRIORITY TICKET. DO THIS BEFORE ANYTHING ELSE.**

The Lab is broken in multiple ways: players sometimes load and sometimes don't, years show "2026 draft" when they should say "2025", data is finicky. This ticket fixes ALL of these issues. Every task must be verified by actually running the server locally and testing the endpoints.

**Exit Criterion**: The Lab loads players reliably every time. No hardcoded years anywhere. Season/year selectors always show correct values. Error states are clear and don't wipe visible data. No race conditions on fast clicks. All three universes (NFL, College, Prospects) load correctly with proper year defaults.

### Task 1: Fix all hardcoded years (CRITICAL)
**Acceptance**: Zero hardcoded year values (2024, 2025, 2026) in any Python or JS file. All replaced with dynamic calculation.
- `tools.py` line ~2916: `2026` hardcoded in draft classification. Replace with `datetime.now().year`.
- `players.py` line ~85: fallback year `2024` hardcoded. Replace with `datetime.now().year - 1` (or calculate from current month like frontend does).
- `college.py` line ~28: fallback year `2024` hardcoded. Same fix.
- `prospects.py` line ~32: fallback year `2025` hardcoded. Replace with `datetime.now().year`.
- Search ALL Python and JS files for any remaining hardcoded year values (2024, 2025, 2026) and replace with dynamic values. Use `grep -rn "2024\|2025\|2026" backend/ frontend/` to find them all. Exclude comments, commit hashes, and version strings.

### Task 2: Fix prospect tiers using wrong state variable (CRITICAL)
**Acceptance**: Prospect tier panel loads correct year's data when viewing prospects. Test: switch to prospects view, select 2025 draft year, open tier panel — it should show 2025 tiers, not whatever the NFL season is set to.
- `lab.js` line ~4405: `state.season` used instead of `state.draftYear` for prospect-tiers API call. Fix to use `state.draftYear` when in prospect view.
- Search lab.js and lab-panels.js for ALL instances where prospect/college endpoints use `state.season` instead of `state.draftYear` or `state.collegeSeason`. Each universe must use its own year variable.

### Task 3: Fix season selector initialization and empty state handling
**Acceptance**: If any filter-options endpoint returns empty data, the Lab shows a clear error message instead of silently breaking. Season always resolves to a valid value. No "pulling film..." infinite spinner.
- `lab.js` lines ~550-554: Add `.catch()` to the nflOpts fetch (currently missing — if it fails, entire init crashes).
- `lab.js` lines ~557-563: Season init uses falsy check `!state.season` which is fragile. Use explicit `state.season == null || state.season === undefined` checks.
- Add validation: if `state.seasons` array is empty after fetching, show an error message to the user instead of silently proceeding with broken state.
- Add a 10-second timeout on init fetches. If they hang, show "data unavailable" instead of spinner forever.

### Task 4: Fix race conditions and request deduplication
**Acceptance**: Rapidly clicking season selector or typing fast in search does not cause stale data to overwrite fresh data. Only the most recent request's response is rendered.
- Add a request counter or AbortController pattern to `fetchAndRenderNFL`, `fetchAndRenderProspects`, and `fetchAndRenderCollege`. If a new request fires before the old one completes, discard the old response.
- Add debounce to season selector changes (200ms) to prevent double-fires.
- Add debounce to any search inputs in lab-panels.js that don't already have it.

### Task 5: Fix error handling — don't wipe data on failure
**Acceptance**: If a fetch fails, the previously loaded data stays visible and an error toast appears. User can still interact with old data while the error is shown.
- `lab.js` lines ~669-674: Screener error handler clears `state.items` to empty array. Instead: keep previous items, show an error toast/banner above the table.
- `lab-panels.js`: All `.catch()` blocks should log `err.message` to console AND show which season/year failed in the error div.
- Add a simple toast/notification system: a div that slides in at the top with the error message and auto-dismisses after 5 seconds.

### Task 6: Verify all fixes end-to-end
**Acceptance**: Start the local server. Test each of these scenarios and confirm they work:
1. Load the Lab — NFL players appear with correct season (not hardcoded)
2. Switch to College view — college players load with correct season
3. Switch to Prospects view — prospects load with correct draft year (not "2026")
4. Open prospect tiers panel — shows data for the selected draft year, not NFL season
5. Rapidly click between seasons — no stale data, no flicker
6. Kill the backend mid-request — error toast appears, previous data stays visible
7. Check all filter dropdowns — years are correct, no future years that don't exist in the data

---

## Backend Cleanup: Add Structured Logging
**Exit Criterion**: Replace bare `except Exception` blocks with proper logging using Python's `logging` module. Add request logging middleware (method, path, status, duration). Log all errors with stack traces. Structured JSON format for production. Console format for local dev. No silent failures anywhere in the backend.
