# QA+UX Audit — Phases 106-109

## Summary
1 HIGH, 4 MEDIUM, 4 LOW findings

## Findings

### QA-1 [HIGH] — Career stats career-row averages rates incorrectly (simple mean instead of weighted)
**File**: `frontend/career.html`, lines 815-819
**Issue**: The career totals row computes rate stats (catch_rate, comp_pct, ypc, ypr) as simple averages across seasons (`sumVal / seasons.length`). This is mathematically wrong. A season with 2 games and a season with 17 games are weighted equally. For example, a player with 65% catch rate over 17 games and 80% catch rate over 2 games would show 72.5% instead of the correct ~66%. The backend already returns per-season counting stats (rec, tgt, car, rush_yd, etc.) so the frontend should compute career rates from those totals instead.
**Fix**: Compute career rate stats from career counting-stat sums. For catch_rate: `total_rec / total_tgt * 100`. For comp_pct: `total_completions / total_pass_att * 100`. For ypc: `total_rush_yd / total_car`. For ypr: `total_rec_yd / total_rec`. The counting stat sums are already computed on line 822-824 for other columns, so apply the same approach for rate columns using the appropriate numerator/denominator.

### QA-2 [MEDIUM] — Draft class position tabs use 2px borders instead of 3px (DESIGN.md violation)
**File**: `frontend/draftclass.html`, lines 66-78
**Issue**: `.dc-pos-tabs` uses `border: 2px solid var(--ink)` and `.dc-pos-tab` uses `border-right: 2px solid var(--ink)`. DESIGN.md specifies all borders should be 3px solid ink. This is inconsistent with tab borders on other pages.
**Fix**: Change both to `3px solid var(--ink)`.

### QA-3 [MEDIUM] — Percentile bar track uses 2px border instead of 3px (DESIGN.md violation)
**File**: `frontend/percentiles.html`, line 198
**Issue**: `.pct-bar-track` uses `border: 2px solid var(--ink)`. DESIGN.md specifies 3px solid ink borders.
**Fix**: Change to `border: 3px solid var(--ink)`.

### QA-4 [MEDIUM] — Career compare legend dot uses 2px border instead of 3px (DESIGN.md violation)
**File**: `frontend/career-compare.html`, line 202
**Issue**: `.cc-legend-dot` uses `border: 2px solid var(--ink)`. DESIGN.md specifies 3px.
**Fix**: Change to `border: 3px solid var(--ink)`.

### QA-5 [MEDIUM] — Draft class player join on name is fragile and may miss matches
**File**: `backend/live_data.py`, line 9532
**Issue**: The draft class query joins `draft_picks` to `players` on `LOWER(p.full_name) = LOWER(d.player_name) AND p.position = d.position`. Name-based joins are inherently fragile: players with name variations (Jr., III, hyphenated names, abbreviated first names) will fail to match, showing 0 games and a "N/A" verdict for real NFL players who have stats. This will affect the hit/bust calculations in the summary.
**Fix**: If `draft_picks` has a `gsis_id` or `pfr_id` column, join on that instead. Otherwise, consider a fuzzy match or at minimum strip suffixes (Jr., III, II) before matching. As a short-term fix, add a `TRIM` and strip common suffixes from both sides.

### QA-6 [LOW] — Percentile search dropdown lacks keyboard navigation (Arrow keys)
**File**: `frontend/percentiles.html`, lines 456-498
**Issue**: The percentiles page search dropdown only supports Escape to close. It does not support ArrowDown/ArrowUp keyboard navigation or Enter to select, unlike the career.html search which has full keyboard support (lines 557-572). Users who navigate with keyboard cannot select a player from the dropdown.
**Fix**: Add ArrowDown/ArrowUp/Enter keydown handlers to the search input, tracking a `highlightIdx` like career.html does.

### QA-7 [LOW] — Career compare URL load has race condition with parallel fetches
**File**: `frontend/career-compare.html`, lines 484-508
**Issue**: `loadFromUrl` fires parallel fetches for all player IDs and pushes to `players` array as they resolve. The check `if (loaded >= pids.length || loaded >= MAX_PLAYERS)` triggers `renderComparison()` but the `players` array may have items in a different order than the URL params (p1, p2, p3) depending on which fetch resolves first. The slot colors (terracotta, blue, teal) will be assigned based on arrival order, not URL order. Sharing a URL may show different color assignments than the original user saw.
**Fix**: Pre-allocate the `players` array with null slots and assign by index: `players[idx] = {...}`. After all loads complete, filter out nulls and render.

### QA-8 [LOW] — Draft class rows all show pointer cursor even when no player_id exists
**File**: `frontend/draftclass.html`, lines 204-207 and 561
**Issue**: CSS applies `cursor: pointer` to ALL tbody rows (line 204-206), but row click navigation only works when `data-pid` attribute exists (line 591-597). If the name join fails (QA-5), `player_id` is empty, `data-pid` is not added, the row still shows pointer cursor but clicking does nothing. This misleads the user.
**Fix**: Change the CSS selector from `.dc-table tbody tr` to `.dc-table tbody tr[data-pid]` for cursor and hover transition.

### QA-9 [LOW] — Percentile HAVING clause silently excludes low-usage players with no explanation
**File**: `backend/live_data.py`, line 9726
**Issue**: The HAVING clause requires `(total_ppr / games) >= 2.0`. If the searched player averages under 2 PPG, they are excluded from their own percentile pool and the function returns empty percentiles with no explanation. The user sees "no percentile data" without understanding why.
**Fix**: Either remove the 2.0 PPG floor (since 4+ games already filters trivial entries) or return a specific error message: "Player averaged less than 2 PPG — below percentile pool threshold".
