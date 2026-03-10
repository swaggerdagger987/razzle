# QA + UX Audit — Phases 26-30

**Date**: 2026-03-10
**Scope**: Phase 26 (Connection mgmt), Phase 27 (Module split), Phase 28 (Caching), Phase 29 (Data expansion), Phase 30 (Route fixes)

## QA FINDINGS

### CRITICAL-1: Missing `nonlocal` in ~25 tools.py cached functions
**Severity**: CRITICAL
**File**: `backend/live_data/tools.py` (~25 functions)
**What's wrong**: Functions wrapped with `_cached()` define a `_query()` closure that reads then assigns `season` (e.g., `if not season: season = ...`). Python treats any assigned variable as local — reading before assignment causes `UnboundLocalError`. Every tools.py endpoint crashes with default params.
**Fix**: Add `nonlocal season` (and `nonlocal draft_year`, `nonlocal week`, `nonlocal window`) at top of each `_query()`.

### HIGH-1: Wrong column name `metric_key` in analytics.py SQL
**Severity**: HIGH
**File**: `backend/live_data/analytics.py` line 371
**What's wrong**: SQL references `m.metric_key` but actual column is `m.stat_key`.
**Fix**: Change `m.metric_key` to `m.stat_key`.

### HIGH-2: `seasonOptions()` hardcodes 2025-2015 in 18 panels
**Severity**: HIGH
**File**: `frontend/lab-panels.js` line 5027
**What's wrong**: Hardcoded year range doesn't adapt to available data.
**Fix**: Compute dynamically or use `available_seasons` from API.

### MEDIUM-1: Aging Curves chart label says "2020-2024" (data is now 2015-2024)
**Severity**: MEDIUM
**File**: `frontend/lab.js` line 6082
**Fix**: Update to dynamic or correct label.

### MEDIUM-2: NFL screener shows 0.0 instead of em-dash for zero counting stats
**Severity**: MEDIUM
**File**: `frontend/lab.js` lines 877-882
**Fix**: Extend em-dash treatment to NFL zero counting stats.

### LOW-1: First-visit toast says "62 tools" (actually ~70)
**Severity**: LOW — `frontend/lab.js` line 587

### LOW-2: Error message tone inconsistency across panels
**Severity**: LOW — panels use flat "failed to load" vs screener's playful "fumbled..."

### LOW-3: `state.season = 0` (falsy init) is fragile
**Severity**: LOW — `frontend/lab.js` line 503

### LOW-4: push_to_turso.py OFFSET pagination is O(n^2) for large tables
**Severity**: LOW — `scripts/push_to_turso.py`

### LOW-5: Cache key for list params uses str(list) representation
**Severity**: LOW — `backend/live_data/prospects.py` line 707
