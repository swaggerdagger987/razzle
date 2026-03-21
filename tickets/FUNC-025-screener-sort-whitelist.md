# FUNC-025: Screener sort silently ignores td_rate, fumble_rate, passer_rating, ay_per_att

## Severity: P2
## Status: RESOLVED — Ship Loop commit 6d54a5d added td_rate, fumble_rate, passer_rating, ay_per_att, ppfd, ppfd_per_game, yprr to safe_sorts (players.py:308). Verified session 32.

## Summary

The screener's `safe_sorts` whitelist (`players.py:289-309`) is missing several derived stats that are valid sort targets. When a user sorts by `td_rate`, `fumble_rate`, `passer_rating`, or `ay_per_att`, the sort_key is silently replaced with `fantasy_points_ppr` (line 311-312), so results appear in PPR order instead of the requested order.

This affects both the API and the frontend (Lab screener column header clicks).

## Evidence

```
Request: POST /api/screener/query {sort_key: "td_rate", sort_direction: "desc", position: "RB"}
Expected: Gibbs (5.3%) > Taylor (5.3%) > Henry (4.9%) > ...
Actual:   McCaffrey (3.9%) > Robinson (2.8%) > Gibbs (5.3%) > Taylor (5.3%)
         (PPR desc order, not td_rate desc)

Request: POST /api/screener/query {sort_key: "passer_rating", sort_direction: "desc", position: "QB"}
Expected: Maye (113.5) > Stafford (109.2) > Goff (105.5) > ...
Actual:   Allen (102.2) > Maye (113.5) > Stafford (109.2) > ...
         (PPR desc order, not passer_rating desc)

Contrast with working sort:
Request: POST /api/screener/query {sort_key: "yards_per_carry", sort_direction: "desc", position: "RB"}
Result:  R.Johnson (8.5) > V.Jones (8.0) > B.Brown (7.4) > ... (correctly sorted)
         yards_per_carry IS in safe_sorts, so it works.
```

## Root Cause

`backend/live_data/players.py:289-312`:

```python
safe_sorts = {
    # ... includes yards_per_carry, catch_rate, comp_pct, etc.
    # ... but MISSING: td_rate, fumble_rate, passer_rating, ay_per_att
}
if sort_key not in safe_sorts:
    sort_key = "fantasy_points_ppr"  # <-- silently overrides
```

These four stats ARE computed by `_enrich_with_derived_stats()` and ARE returned in the API response, but the sort whitelist doesn't know about them. The python_sort logic at line 397 works correctly — the bug is upstream at the whitelist.

## Fix

Add missing derived stats to `safe_sorts` at line 289:

```python
safe_sorts = {
    # ... existing entries ...
    # Derived stats from _enrich_with_derived_stats
    "td_rate", "fumble_rate", "passer_rating", "ay_per_att",
    # Also consider: "ppfd", "ppfd_per_game", "yprr"
}
```

Also check if any other stats from `_enrich_with_derived_stats` are missing:
- `ppfd` / `ppfd_per_game` (Points Per First Down)
- `yprr` (Yards Per Route Run)
- `breakout_pct` (from `_enrich_with_breakout`)

## Files
- `backend/live_data/players.py:289-312` (safe_sorts whitelist)

## Affects
- Lab screener column sorting for td_rate, fumble_rate, passer_rating, ay_per_att
- Any API consumer using sort_key with these columns
