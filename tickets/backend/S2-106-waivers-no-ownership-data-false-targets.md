---
id: S2-106
severity: S2
confidence: MEDIUM
category: missing-feature
source: functional-qa/flows.md flow #30 (P2: no ownership data, Bryce Young #1 = rostered everywhere)
status: OPEN
---

# Waivers panel has no roster ownership data — shows rostered players as waiver targets

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Endpoint**: `backend/server.py:3287-3294` — `GET /api/waivers`
**Handler**: `backend/live_data/tools.py:1301-1398` — `fetch_waivers()`

The function queries only `player_week_stats` columns: `p.player_id, p.full_name, p.position, p.team, s.week, s.fantasy_points_ppr`. Surge is calculated as recent PPG vs season PPG delta.

**No ownership data exists in the database.** The `player_week_stats` table schema (`adapters/nflverse_adapter.py:152-199`) has no `ownership_pct` column. The Sleeper API `owned_count` field is not fetched or stored by any adapter.

## Fix

Two options (ordered by complexity):

**Option A (label fix — quick):** Rename the panel from "Waivers" to "Rising Players" or "Trending Up" to accurately describe what it shows. Update the subtitle and description to clarify these are trending players, not necessarily waiver-available.

**Option B (feature — harder):** Integrate Sleeper's player ownership data (`/players/nfl` endpoint has `owned_count`). Add an `ownership_pct` column. Filter or flag players with >80% ownership as "likely rostered." This requires a new data pipeline and periodic refresh.

## Files to Change

**Option A:**
- Frontend waivers panel HTML (panel title, subtitle)
- Lab sidebar label for the waivers panel
- `lab-panels.js` — panel heading text

**Option B:**
- `backend/live_data/` — new ownership data fetch from Sleeper
- `adapters/` — ownership data adapter
- Frontend waivers panel — add ownership column

## Accept When

- Either: Panel name accurately reflects content (Option A)
- Or: Players with >80% ownership are flagged/filtered (Option B)

## Do NOT Touch

- The trending/delta calculation (it's correct for what it measures)
- FAAB values (no data source available)
