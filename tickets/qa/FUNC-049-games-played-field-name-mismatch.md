# FUNC-049: GP Column Shows "-" in 3 Panels — games_played vs games Field Name Mismatch

**Severity**: P1
**Flow**: Season Pace, Air Yards, Report Cards panels
**Found**: Session 47 (2026-03-21)
**Status**: OPEN
**Related**: None (systemic frontend field mapping error)

## Description

Three Lab panels reference `p.games_played` for the Games Played (GP) column, but all backend APIs return the field as `p.games`. Since `undefined != null` evaluates to `false` in JavaScript, the GP column silently displays `-` for every player instead of their actual game count.

**Affected panels and lines:**

| Panel | Line | Code | Impact |
|-------|------|------|--------|
| Season Pace | lab-panels.js:5142 | `p.games_played != null ? p.games_played : '-'` | GP shows `-` for all 50 players |
| Air Yards | lab-panels.js:5310 | `{ key: 'games_played', ... sortable: true }` | GP column sort broken (sorts undefined) |
| Air Yards | lab-panels.js:5436 | `p.games_played != null ? p.games_played : '-'` | GP shows `-` for all players |
| Report Cards | lab-panels.js:6280 | `{ key: 'games_played', ... sort: true }` | GP column sort broken |
| Report Cards | lab-panels.js:6313 | `p.games_played != null ? p.games_played : '-'` | GP shows `-` for all players |

**APIs confirmed to return `games` (NOT `games_played`):**
- `/api/season-pace` → `games: 16`
- `/api/air-yards` → `games: 17`
- `/api/report-cards` → `games: 17`
- `/api/snap-efficiency` → `games`
- `/api/dual-threat` → `games`
- `/api/td-regression` → `games`
- `/api/workload-monitor` → `games`
- `/api/target-premium` → `games`

**Note:** Many other panels correctly use `p.games || p.games_played` fallback pattern (lines 5591, 5647, 5677, 5800, 5828, 5863, 5890, 6708). Only the 3 panels listed above use `games_played` without fallback.

## Root Cause

Frontend developer used `games_played` as the field name in these panels, but the backend API returns `games`. The `|| fallback` pattern was used correctly in other panels but missed in these three.

## Fix

Replace `games_played` with `games` in the 5 affected locations:

```javascript
// lab-panels.js:5142 (Season Pace)
- (p.games_played != null ? p.games_played : '-')
+ (p.games != null ? p.games : '-')

// lab-panels.js:5310 (Air Yards column def)
- { key: 'games_played', label: 'GP', sortable: true, tip: 'Games played' },
+ { key: 'games', label: 'GP', sortable: true, tip: 'Games played' },

// lab-panels.js:5436 (Air Yards render)
- (p.games_played != null ? p.games_played : '-')
+ (p.games != null ? p.games : '-')

// lab-panels.js:6280 (Report Cards column def)
- { key: 'games_played', label: 'GP', sort: true },
+ { key: 'games', label: 'GP', sort: true },

// lab-panels.js:6313 (Report Cards render)
- (p.games_played != null ? p.games_played : '-')
+ (p.games != null ? p.games : '-')
```

## Verification

1. Open Season Pace panel → GP column should show numbers (16, 17, etc.) not "-"
2. Open Air Yards panel → GP column should show numbers, sorting by GP should work
3. Open Report Cards panel → GP column should show numbers, sorting by GP should work
4. Verify no other panels regress (search for remaining `games_played` references)
