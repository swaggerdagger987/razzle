---
id: S2-106
severity: S2
confidence: MEDIUM
category: missing-feature
source: functional-qa/flows.md flow #30 (P2: no ownership data, Bryce Young #1 = rostered everywhere)
status: OPEN
---

# Waivers panel has no roster ownership data — shows rostered players as waiver targets

## Root Cause

The waivers endpoint surfaces "trending up" players based on recent performance delta, but has no ownership percentage data. Without roster ownership context, the panel recommends universally-rostered players (e.g., Bryce Young at #1) as "waiver targets" — players no one can actually pick up on waivers.

No ownership data source is integrated. Sleeper API provides `owned_count` per player, but this is not fetched or stored.

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
