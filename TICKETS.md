# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Lab Backend Performance Hardening

**Exit Criterion**: Screener API response < 200ms for typical queries. Enrichment queries batched. Database indexes optimized. No API contract changes. All 59 existing tests pass (`python -m pytest tests/ -v`).

### Task 1: Add missing database indexes

**File**: `adapters/nflverse_adapter.py`

In the `initialize_database()` function, find the index block after the `player_week_metrics` table definition (line ~218-219). After the existing two indexes (`idx_pwm_key_val`, `idx_pwm_player`), add:

```sql
CREATE INDEX IF NOT EXISTS idx_pwm_player_key ON player_week_metrics(player_id, stat_key);
CREATE INDEX IF NOT EXISTS idx_pwm_season_player ON player_week_metrics(season, player_id);
```

**Why**: `_enrich_with_rate_metrics` in `backend/live_data/core.py` (line ~299) queries `WHERE m.player_id IN (...) AND m.stat_key IN (...) GROUP BY m.player_id, m.stat_key`. The existing indexes (`stat_key, stat_value` and `player_id, season, week`) do not cover this access pattern. The new `(player_id, stat_key)` composite index directly supports both the WHERE and GROUP BY.

Also after the `player_week_stats` indexes (line ~202-204), add:

```sql
CREATE INDEX IF NOT EXISTS idx_pws_player_season_ppr ON player_week_stats(player_id, season, fantasy_points_ppr);
```

**Why**: `_enrich_with_breakout` in `core.py` (line ~339) runs `SELECT player_id, season, SUM(fantasy_points_ppr) FROM player_week_stats WHERE player_id IN (...) GROUP BY player_id, season`. This covering index lets SQLite satisfy the query from the index alone without touching the table.

Also after the `players` table indexes (line ~148-151), add:

```sql
CREATE INDEX IF NOT EXISTS idx_players_pos_relevant ON players(position, fantasy_relevant);
```

**Why**: `quick_search_players` (line ~59 of `backend/live_data/players.py`) filters `WHERE p.position IN ('QB','RB','WR','TE') AND p.fantasy_relevant = 1`. This composite index avoids a full table scan.

**Acceptance**: All 4 new `CREATE INDEX IF NOT EXISTS` statements present. `python -m pytest tests/ -v` passes. Indexes are idempotent (use IF NOT EXISTS).

---

### Task 2: Reduce over-fetch in _enrich_with_pbp_stats (SELECT * removal)

**File**: `backend/live_data/core.py`

In `_enrich_with_pbp_stats()` (line ~491), the non-career branch uses `SELECT * FROM player_season_pbp`. Replace with an explicit column list:

Change:
```python
        query = f"""
            SELECT * FROM player_season_pbp
            WHERE player_id IN ({placeholders}) AND season = ?
        """
```

To:
```python
        query = f"""
            SELECT player_id,
                pass_success_rate, rush_success_rate, total_ryoe, ryoe_per_carry,
                avg_score_differential, play_action_attempts, play_action_completions,
                play_action_yards, play_action_tds, scramble_attempts, scramble_yards,
                scramble_tds, garbage_time_pct, gl_carries, gl_targets, gl_tds,
                two_point_conversions, return_yards, return_tds,
                intended_air_yards, intended_air_yards_per_target, drops, drop_rate,
                bye_week, games_missed
            FROM player_season_pbp
            WHERE player_id IN ({placeholders}) AND season = ?
        """
```

**Why**: `player_season_pbp` has columns beyond what's consumed (season, source, updated_at, etc). The `pbp_cols` list at line ~501 defines exactly what gets merged into items. Fetching only needed columns reduces row transfer size and I/O. The career-mode branch already selects explicit columns.

**Acceptance**: `SELECT *` replaced. The column list matches `pbp_cols` on line ~501 (plus `player_id`). Tests pass.

---

### Task 3: Reduce 5x over-fetch multiplier for post-filters

**File**: `backend/live_data/players.py`

In `_fetch_screener_uncached()` (line ~404), find:

```python
        # When post-filters exist, fetch more rows to account for filtering
        sql_limit = limit * 5 if post_filters else limit
        sql_offset = 0 if post_filters else offset
```

Replace with:

```python
        # When post-filters exist, fetch more rows to account for filtering.
        # Use 2x for a single simple filter, 3x for multiple filters.
        if post_filters:
            multiplier = 2 if len(post_filters) <= 1 else 3
            sql_limit = limit * multiplier
            sql_offset = 0
        else:
            sql_limit = limit
            sql_offset = offset
```

**Why**: The 5x multiplier means a `limit=200` screener request fetches 1000 rows, then runs ALL enrichment functions (_enrich_with_rate_metrics, _enrich_with_breakout, _enrich_with_team_shares, _enrich_with_pbp_stats) on 1000 rows instead of ~200-400. Each enrichment function does its own SQL round-trip for all those player IDs. Reducing to 2-3x cuts enrichment work by 40-60%. The most common case is a single post-filter (e.g., "ppg > 15"), which rarely eliminates more than 50% of rows, so 2x is sufficient.

**Acceptance**: Multiplier is 2 for single filter, 3 for multiple. Tests pass. No change to the post-filter application logic below (lines ~434-455).

---

### Task 4: Add Cache-Control headers on screener POST endpoints

**File**: `backend/server.py`

The existing `cache_control_middleware` (line ~409) only applies to GET requests. The screener endpoints are POST, so they get no browser caching. Fix both endpoints:

At line ~1198, change:

```python
@app.post("/api/screener/query")
async def screener_query(request: Request):
    body = await request.json()
    return live_data.fetch_screener(body)
```

To:

```python
@app.post("/api/screener/query")
async def screener_query(request: Request):
    body = await request.json()
    data = live_data.fetch_screener(body)
    return JSONResponse(content=data, headers={"Cache-Control": "public, max-age=60"})
```

At line ~1204, change:

```python
@app.post("/api/screener/sparklines")
async def screener_sparklines(request: Request):
    body = await request.json()
    player_ids = body.get("player_ids", [])
    season = body.get("season", 0)
    return live_data.fetch_screener_sparklines(player_ids, season)
```

To:

```python
@app.post("/api/screener/sparklines")
async def screener_sparklines(request: Request):
    body = await request.json()
    player_ids = body.get("player_ids", [])
    season = body.get("season", 0)
    data = live_data.fetch_screener_sparklines(player_ids, season)
    return JSONResponse(content=data, headers={"Cache-Control": "public, max-age=60"})
```

**Why**: 60-second browser cache means rapid tab-switching, back-button navigation, and repeated screener queries within a minute hit the browser cache instead of the server. `JSONResponse` is already imported at line 11 (`from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response`). The backend's internal 5-minute cache (via `_cached()`) still works independently. No API contract change -- same JSON shape, just an added response header.

**Acceptance**: Both endpoints return `JSONResponse` with `Cache-Control: public, max-age=60`. Response body shape is identical (dict with `count`, `season`, `items` keys for screener; dict with `sparklines`, `season` keys for sparklines). Tests pass.

---

## Phase: Lab Frontend Performance Hardening

**Exit Criterion**: Lab initial render < 500ms for 1000-row dataset. Sort/filter feels instant. Scroll is jank-free. Zero functionality or visual changes.

### Task 1: Lazy virtual scroll row building

**File**: `frontend/lab.js`

In `renderTableBody()` (~line 1877-1893), the loop pre-builds HTML for ALL rows into `_vscrollRows` before `renderVisibleRows()` displays ~30-50 of them. This costs 500-1500ms on 1000 rows.

Change: Instead of pre-building all rows, make `_vscrollRows` a sparse array. In the `for` loop that populates `_vscrollRows`, replace eager `buildRowHTML()` calls with `null` placeholders. Then in `renderVisibleRows()` (~line 1802), lazily call `buildRowHTML()` only for visible indexes that are still `null`, and cache the result.

Keep the percentile/bar/leader pre-computations (`computePercentiles`, `computeBarMaxes`, `computeLeaderRanks`) — they need the full dataset for correct values. Only defer the HTML string building.

**Acceptance**: `_vscrollRows` is populated lazily. Only visible rows + small buffer (~10 above/below) have HTML built. Initial render builds ~50-70 rows max, not 1000. All sorting, filtering, heat colors, data bars still work identically.

---

### Task 2: Set-based selection and watchlist lookups

**File**: `frontend/lab.js`

Currently `state.selectedPlayers.some(p => p.player_id === playerId)` is called on every row during render (~line 1647). Same for `isOnWatchlist()` (~line 1654). With 1000 rows and 50 selected players, that's 50,000 comparisons.

Fix:
1. Add `state._selectedSet = new Set()` initialized empty
2. Whenever `state.selectedPlayers` is modified (push, splice, filter, clear), also update `state._selectedSet` — add/delete the player_id
3. Replace `state.selectedPlayers.some(p => p.player_id === playerId)` with `state._selectedSet.has(playerId)` everywhere in the file
4. Do the same for watchlist: maintain a `_watchlistSet` (module-level), update it in `setWatchlist()`/`addToWatchlist()`/`removeFromWatchlist()`, and use `.has()` in `isOnWatchlist()`

**Acceptance**: Zero `.some()` calls remain for selection or watchlist membership checks during row rendering. `Set.has()` used instead. All select/deselect/watchlist UI behavior unchanged.

---

### Task 3: Client-side screener query cache

**File**: `frontend/lab.js`

In the fetch call to `/api/screener/query` (~line 1232), add a simple in-memory cache:

```javascript
var _queryCache = {};
var _queryCacheKeys = [];
var QUERY_CACHE_MAX = 5;
```

Before fetching, compute a cache key from `JSON.stringify(requestBody)`. If the key exists in `_queryCache`, return the cached result immediately (skip fetch). On successful fetch, store the result and evict the oldest entry if cache exceeds 5.

Clear `_queryCache` when the user changes universe (NFL/college/prospect) or does a hard refresh.

**Why**: Toggling visual modes (heat colors, percentiles, data bars) doesn't change the query but triggers a re-fetch. This eliminates ~200-500ms on those interactions.

**Acceptance**: Repeat identical queries return cached data instantly. Cache holds max 5 entries. Filter/sort changes produce new cache keys (different request body). Visual mode toggles don't re-fetch.

---

### Task 4: Debounce filter inputs

**File**: `frontend/lab.js`

Check if the search input and filter dropdowns already have debouncing. If the search input fires `fetchAndRender()` on every keystroke without delay, wrap it in a 150ms debounce:

```javascript
var _filterDebounceTimer = null;
function debouncedFetch() {
    clearTimeout(_filterDebounceTimer);
    _filterDebounceTimer = setTimeout(fetchAndRender, 150);
}
```

Attach `debouncedFetch` to the search input's `input` event instead of calling `fetchAndRender` directly.

**Acceptance**: Typing "Patrick Mahomes" in the search box fires 1-2 API calls, not 15. Dropdown filters can remain immediate (no debounce needed).

---

### Task 5: Cache column definitions in render loop

**File**: `frontend/lab.js`

In `buildRowHTML()` (~line 1644-1800), `getColumnDef(key)` is called for every column × every row. For 50 cols × 1000 rows = 50,000 lookups. The function checks `isProspectView()` and `state.universe` on every call.

Fix: Before the row-building loop in `renderTableBody()`, resolve column definitions once into a Map:

```javascript
var _colDefCache = {};
for (var k = 0; k < cols.length; k++) {
    _colDefCache[cols[k]] = getColumnDef(cols[k]);
}
```

Pass `_colDefCache` into `buildRowHTML()` and use it instead of calling `getColumnDef()` per cell.

**Acceptance**: `getColumnDef()` is called once per column per render cycle, not once per cell. `buildRowHTML` receives pre-resolved column definitions.

---

