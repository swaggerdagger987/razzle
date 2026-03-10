# QA + UX Audit — Phases 91-94

**Date**: 2026-03-10
**Scope**: Phase 91 (QA fixes), Phase 92 (VORP), Phase 93 (Trade Value Chart), Phase 94 (Trade Finder)

---

## QA FINDINGS

### QA-1: MEDIUM — Missing fantasy_relevant filter in trade value + trade finder queries
**File**: `backend/live_data.py`, lines 8126 and 8203
**What's wrong**: `fetch_trade_value_chart` and `fetch_trade_finder` don't filter on `p.fantasy_relevant = 1`, unlike every other dashboard endpoint (VORP, stock watch, opportunity share, etc.). This means non-fantasy-relevant players (special teamers, backup QBs with minimal stats) can appear in trade value rankings and trade target results if they meet the 4-game / 2-PPG threshold.
**Fix**: Add `AND p.fantasy_relevant = 1` to the WHERE clause in both functions' SQL queries.

### QA-2: MEDIUM — Inefficient percentile_rank in fetch_trade_finder (O(n^2))
**File**: `backend/live_data.py`, lines 8305-8312
**What's wrong**: `percentile_rank()` sorts the entire values dict on every call. It's called 3 times per player (PPO, CoV, PPG), so for N players this is O(3N * N log N). With ~200 fantasy-relevant players this is negligible, but the pattern is wasteful. Pre-sorting once would be cleaner.
**Fix**: Pre-sort each metric's values once before the loop, then use bisect for O(log N) per lookup.

### QA-3: MEDIUM — Trade finder stock scoring uses 3-factor model vs stock watch's 4-factor
**File**: `backend/live_data.py`, line 8321
**What's wrong**: Trade finder computes stock score as `PPO * 0.33 + CoV * 0.33 + PPG * 0.34` (3 factors, no SOS), while the real stock watch endpoint (line 6951) uses `PPO * 0.25 + CoV * 0.25 + SOS * 0.25 + PPG * 0.25` (4 factors including SOS). This means the stock_trend arrows in the trade finder won't match the stock watch page's rising/falling classifications.
**Fix**: Either add SOS computation to trade finder's stock scoring (matching the 4-factor model), or document the discrepancy. The 4-factor model is more accurate but requires the defense PPG-allowed grid query.

### QA-4: LOW — Duplicate players possible in trade finder results
**File**: `backend/live_data.py`, lines 8349-8358
**What's wrong**: A player can appear in both `equal_targets` AND `buy_low` (or `sell_high`) if they're within the +/- 8 value range AND have the right stock trend AND are within the +/- 15 extended range. This creates duplicates across sections.
**Fix**: Exclude equal-value players from buy_low/sell_high, or deduplicate by preferring the more specific section.

### QA-5: LOW — VORP endpoint returns `name` field instead of `full_name`
**File**: `backend/live_data.py`, line 7998
**What's wrong**: `fetch_vorp` uses `"name"` as the key for player name, while every other endpoint uses `"full_name"`. The frontend (vorp.html line 493) reads `p.name`, so it works, but it's inconsistent with the rest of the API.
**Fix**: Change key to `full_name` in fetch_vorp and update vorp.html to match.

---

## UX FINDINGS

### UX-1: HIGH — Trade Finder has no helpful error when player not in trade value pool
**Context**: If a user searches for a player who doesn't meet the 4-game / 2-PPG threshold (injured player, late-season pickup, rookie who played 3 games), the API returns `{"error": "Player not found"}`. The frontend shows a generic error message.
**Impact**: Dynasty managers frequently trade injured or low-game players. The error message doesn't explain WHY the player wasn't found — the user might think the tool is broken.
**Fix**: Show a specific message: "Player hasn't played enough games (min 4) or doesn't meet the 2 PPG threshold for trade values." Consider showing the player's basic info even without trade data.

### UX-2: MEDIUM — 34 nav links is getting unwieldy
**Context**: The topnav now has 34 links. On desktop this wraps heavily; on mobile it's a very long scrollable list.
**Impact**: Navigation is getting harder to use as dashboards accumulate. Users can't easily find what they want.
**Fix**: Log as future structural improvement. Not actionable in a single fix task — needs nav redesign.

### UX-3: LOW — Trade Finder empty states for Buy Low / Sell High lack context
**Context**: If the selected player has no buy-low or sell-high targets, the sections show "no targets found" without explanation.
**Fix**: Add contextual empty-state messages explaining why no targets are available.

### UX-4: LOW — VORP "Replacement Level" section count doesn't adapt to position filter
**Context**: The replacement_level section always shows bottom 25 players regardless of position filter, which becomes redundant when viewing a single position.
**Fix**: Adjust count based on position filter.

---

## SUMMARY

| Category | CRITICAL | HIGH | MEDIUM | LOW |
|----------|----------|------|--------|-----|
| QA       | 0        | 0    | 3      | 2   |
| UX       | 0        | 1    | 1      | 2   |
| **Total** | **0**   | **1** | **4** | **4** |
