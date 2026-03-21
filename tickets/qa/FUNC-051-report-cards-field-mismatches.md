# FUNC-051: Report Cards Panel — Dominator Column Shows "-", GPA Sort Broken

**Severity**: P1
**Flow**: Report Cards panel
**Found**: Session 47 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-049 (games_played mismatch also applies here)

## Description

The Report Cards panel has three field name mismatches causing broken columns and sorting:

### 1. Dominator column shows "-" for every player (P1)

Frontend reads `p.dominator` (lab-panels.js:6277, 6309) but the API returns `dom_rating`.

- Column def: `{ key: 'dominator', label: 'Dom', sort: true }`
- Render: `fmt(p.dominator)` → `fmt(undefined)` → `'-'`
- API field: `dom_rating: 28.5`

Every player's Dominator Rating shows `-` instead of their actual value. Sorting by Dom also compares undefined values.

### 2. GPA sorting broken (P2)

Column def uses `{ key: 'gpa', label: 'GPA', sort: true }` but API returns `gpa_pct` (numeric percentile) and `gpa_grade` (letter grade like "A+").

- **Display works** via fallback at line 6300: `p.gpa_grade || p.grade || fmt(p.gpa)` — since `gpa_grade` exists in the API, the letter grade displays correctly.
- **Sorting broken**: The sort comparator accesses `p.gpa` which is undefined for all players, so clicking the GPA column header does nothing.
- Should sort by `gpa_pct` (the numeric value) for meaningful ordering.

### 3. GP column shows "-" (covered by FUNC-049)

`games_played` → `games` mismatch, same as FUNC-049.

## API Response Fields

```json
{
  "gpa_grade": "A+",    // frontend sort key expects: gpa
  "gpa_pct": 98.5,      // should be used for sort key
  "dom_rating": 28.5,   // frontend expects: dominator
  "games": 17           // frontend expects: games_played
}
```

## Fix

```javascript
// lab-panels.js:6271 — GPA column sort key
- { key: 'gpa', label: 'GPA', sort: true },
+ { key: 'gpa_pct', label: 'GPA', sort: true },

// lab-panels.js:6277 — Dominator column key
- { key: 'dominator', label: 'Dom', sort: true },
+ { key: 'dom_rating', label: 'Dom', sort: true },

// lab-panels.js:6280 — GP column key (FUNC-049)
- { key: 'games_played', label: 'GP', sort: true },
+ { key: 'games', label: 'GP', sort: true },

// lab-panels.js:6309 — Dominator render
- html += '<td class="rpc-num">' + fmt(p.dominator) + '%</td>';
+ html += '<td class="rpc-num">' + fmt(p.dom_rating) + '%</td>';

// lab-panels.js:6313 — GP render (FUNC-049)
- html += '<td class="rpc-num">' + (p.games_played != null ? p.games_played : '-') + '</td>';
+ html += '<td class="rpc-num">' + (p.games != null ? p.games : '-') + '</td>';
```

## Verification

1. Open Report Cards panel → Dom column should show percentages (e.g., "28.5%") not "-"
2. Sorting by Dom should order by actual dominator rating
3. Sorting by GPA should order by gpa_pct (numeric percentile), not be a no-op
4. GP column should show game counts not "-"
