# FUNC-057: career.html + percentiles.html — Initial Load Search Input Stays Empty

**Severity**: P2
**Flow**: Player profiles / standalone pages (flows 13, related to flow 5)
**Found**: Session 51 (2026-03-21)
**Status**: OPEN
**Related**: Ship Loop commit 846e71a fixed the FIRST quick-search call in each file but missed the SECOND call (initial URL load)

## Description

When a user visits `career.html?player=00-0033873` or `percentiles.html?player=00-0033873`, the career/percentiles data loads correctly BUT the search input field stays empty. The user has no visual confirmation of which player they're viewing in the search box.

The root cause: both files have TWO quick-search calls. Ship Loop fixed the first one (autocomplete dropdown) but missed the second one (initial URL-based player load).

### career.html (line 965)

```javascript
// Line 962-969 — initial load from URL
fetch('/api/players/quick-search?q=' + encodeURIComponent(initialPlayer) + '&limit=1')
  .then(function(r) { if (!r.ok) throw new Error('search failed'); return r.json(); })
  .then(function(d) {
    if (d.players && d.players.length > 0) {  // ← BROKEN: API returns array, not {players: [...]}
      searchInput.value = d.players[0].full_name;  // ← Never reached
    }
  })
```

### percentiles.html (line 608)

```javascript
// Line 605-610 — initial load from URL
fetch('/api/players/quick-search?q=' + encodeURIComponent(initialPlayer) + '&limit=1')
  .then(function(r) { if (!r.ok) throw new Error('search failed'); return r.json(); })
  .then(function(d) {
    if (d.players && d.players.length > 0) searchInput.value = d.players[0].full_name;  // ← BROKEN
  })
```

### API Response

```json
// GET /api/players/quick-search?q=00-0033873&limit=1
[
  {"player_id": "00-0033873", "full_name": "Patrick Mahomes", "position": "QB", "team": "KC", ...}
]
// Returns raw array — NOT {players: [...]}
```

## Fix

```javascript
// career.html:965
- if (d.players && d.players.length > 0) {
-   searchInput.value = d.players[0].full_name;
+ var arr = Array.isArray(d) ? d : (d.players || []);
+ if (arr.length > 0) {
+   searchInput.value = arr[0].full_name;

// percentiles.html:608
- if (d.players && d.players.length > 0) searchInput.value = d.players[0].full_name;
+ var arr = Array.isArray(d) ? d : (d.players || []);
+ if (arr.length > 0) searchInput.value = arr[0].full_name;
```

## Verification

1. Visit `career.html?player=00-0033873`
2. Search input should show "Patrick Mahomes" (currently stays empty)
3. Career data and chart should still load correctly (this part works)
4. Same test for `percentiles.html?player=00-0033873`
