# FUNC-050: Air Yards Panel — AY% Column Shows "-%", GP Shows "-"

**Severity**: P1
**Flow**: Air Yards panel (flow 32)
**Found**: Session 47 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-049 (games_played mismatch — GP part of this bug)

## Description

The Air Yards panel has two field name mismatches causing broken columns:

### 1. AY% column shows "-%"

Frontend reads `p.air_yard_pct` (lab-panels.js:5431) but the API returns `air_yards_share`.

- API value: `air_yards_share: 0.249` (decimal, 24.9%)
- Frontend code: `fmt(p.air_yard_pct) + '%'`
- Displayed: `-%` (since `p.air_yard_pct` is undefined, `fmt(undefined)` returns `'-'`)

Additionally, even after fixing the field name, the value needs to be multiplied by 100 to display as a percentage. The API returns `0.249` but the display should show `24.9%`.

**Column definition also mismatched** (lab-panels.js:5305):
```javascript
{ key: 'air_yard_pct', label: 'AY%', sortable: true, tip: 'Air yard share of team total' }
```
This uses `air_yard_pct` as the sort key, so sorting by AY% compares `undefined` values.

### 2. GP column shows "-" (part of FUNC-049)

Frontend reads `p.games_played` (lab-panels.js:5436) but API returns `games`.

## Verified API Response

```json
{
  "air_yards_share": 0.249,   // frontend expects: air_yard_pct
  "games": 17                 // frontend expects: games_played
}
```

## Fix

```javascript
// lab-panels.js:5305 — column definition
- { key: 'air_yard_pct', label: 'AY%', sortable: true, tip: 'Air yard share of team total' },
+ { key: 'air_yards_share', label: 'AY%', sortable: true, tip: 'Air yard share of team total' },

// lab-panels.js:5431 — render cell (also multiply by 100 for percentage)
- html += '<td class="ay-num">' + fmt(p.air_yard_pct) + '%</td>';
+ html += '<td class="ay-num">' + fmt(p.air_yards_share != null ? (p.air_yards_share * 100) : null) + '%</td>';

// lab-panels.js:5310 — GP column definition (FUNC-049)
- { key: 'games_played', label: 'GP', sortable: true, tip: 'Games played' },
+ { key: 'games', label: 'GP', sortable: true, tip: 'Games played' },

// lab-panels.js:5436 — GP render cell (FUNC-049)
- html += '<td class="ay-num">' + (p.games_played != null ? p.games_played : '-') + '</td>';
+ html += '<td class="ay-num">' + (p.games != null ? p.games : '-') + '</td>';
```

## Verification

1. Open Air Yards panel → AY% column should show percentages (e.g., "24.9%") not "-%"
2. AY% sorting should order by actual air yards share
3. GP column should show game counts (e.g., "17") not "-"
4. GP sorting should order by actual games played
