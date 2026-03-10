# QA + UX Audit — Phases 51-55

**Date**: 2026-03-09
**Scope**: Phase 51 (Manager Profiles), Phase 52 (Agent Memory), Phase 53 (Reddit Launch Prep), Phase 54 (Heat Coloring), Phase 55 (Player Headshots)

---

## QA FINDINGS

### CRITICAL

**QA-1: XSS via unescaped Sleeper API data in league-intel.html**
- **File**: `frontend/league-intel.html`, lines 441, 443, 529, 535, 538-540
- **What**: Sleeper API data (league.name, p.name, p.team, userId, pos) injected into innerHTML without `escapeHtml()`. league_id and userId interpolated into onclick attribute without `escapeAttr()`.
- **Risk**: A malicious Sleeper league name or compromised API response injects arbitrary HTML/JS.
- **Fix**: Wrap all Sleeper-sourced values in `escapeHtml()` for innerHTML and `escapeAttr()` for attributes.

### HIGH

**QA-2: FILTER_COLUMN_MAP references non-existent DB columns**
- **File**: `backend/live_data.py`, lines 788-789, 799
- **What**: `pass_attempts` and `total_tds` in FILTER_COLUMN_MAP reference columns that don't exist in player_week_stats (actual columns are `attempts` and `touchdowns`). Filtering by these keys causes runtime SQL errors (500 response).
- **Fix**: Change to `"pass_attempts": "SUM(s.attempts)"` and `"total_tds": "SUM(s.touchdowns)"`.

### MEDIUM

**QA-3: Sleeper players endpoint (~1MB) re-fetched on every league card expand**
- **File**: `frontend/league-intel.html`, lines 492-496
- **What**: `/players/nfl` returns ~1MB of JSON, fetched fresh every time `toggleLeague` is called. Never cached.
- **Fix**: Cache in a module-level variable after first fetch.

**QA-4: 18 concurrent Sleeper transaction requests per manager profile load**
- **File**: `frontend/league-intel.html`, lines 620-631
- **What**: Fires 18 simultaneous requests to Sleeper API for weeks 1-18. Aggressive for Sleeper's infrastructure.
- **Fix**: Batch requests (6 at a time) or cache results in localStorage.

**QA-5: 1px borders on league-intel stat badges violate design guide**
- **File**: `frontend/league-intel.html`, lines 261-265, 167
- **What**: `.profile-stat` uses `border: 1px solid var(--ink-faint)`, `.roster-pos` uses `border: 1.5px`. Design guide says no thin 1px borders on primary elements.
- **Fix**: Change to `border: 2px solid var(--ink-faint)`.

### LOW

**QA-6: formatTimeAgo shows "0 min ago" for recent entries**
- **File**: `frontend/warroom.js`, lines 2412-2418
- **What**: Entries less than 60 seconds old show "0 min ago" instead of "just now".
- **Fix**: Add check `if (mins < 1) return 'just now';`.

**QA-7: Duplicate esc() function in player.js**
- **File**: `frontend/player.js`, lines 773-777
- **What**: Local `esc()` duplicates `escapeHtml()` from app.js. Maintenance risk.

**QA-8: Dead group variable assignment in league-intel.html**
- **File**: `frontend/league-intel.html`, line 522
- **What**: `group` variable assigned but never read.

---

## UX FINDINGS

### HIGH

**UX-1: Heat coloring has no legend or visual key**
- When a user toggles Heat (H shortcut), cells turn green/red but there's no indicator explaining what the colors mean. A user seeing this for the first time has no context. A small legend or tooltip on the Heat button ("per-position percentile: green = elite, red = below average") would eliminate confusion.

**UX-2: Heat button stays visible and active in college/prospect mode where results are sparse**
- The Heat toggle works in all universes but college/prospect data has few numeric columns, making heat coloring mostly invisible. The button should either be hidden in non-NFL modes or show a tooltip noting limited data.

### MEDIUM

**UX-3: No visual feedback when headshot fails to load (brief flash)**
- When a headshot image fails to load, there's a brief flash of the broken-image placeholder before onerror fires. Setting a CSS background on the img element would make the transition seamless.

**UX-4: Default Lab table column set may be too dense for first-time visitors**
- A new user sees many columns on first load. Headshots help identify players but column density can overwhelm.

### LOW

**UX-5: College/prospect initials headshots could confuse users who expect photos**
- College players show position-colored initials. Consistent but no explanation for why NFL has photos and college doesn't.

---

## ACTION ITEMS

| Priority | Finding | Action |
|----------|---------|--------|
| CRITICAL | QA-1 | Escape all Sleeper API data in league-intel.html |
| HIGH | QA-2 | Fix FILTER_COLUMN_MAP column names in live_data.py |
| HIGH | UX-1 | Add heat coloring legend/tooltip |
| HIGH | UX-2 | Disable/hide Heat in non-NFL modes or add tooltip |
| MEDIUM | QA-3 | Cache Sleeper players response |
| MEDIUM | QA-4 | Batch Sleeper transaction requests |
| MEDIUM | QA-5 | Fix 1px borders in league-intel.html |
| MEDIUM | UX-3 | Add CSS fallback background on headshot img |
| LOW | QA-6 | Fix formatTimeAgo "0 min ago" |
| LOW | QA-7, QA-8 | Dead code cleanup (grouped) |
| LOW | UX-4, UX-5 | Polish notes (logged, not tasked) |
