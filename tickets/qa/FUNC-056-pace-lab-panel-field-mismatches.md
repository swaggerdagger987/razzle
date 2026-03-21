# FUNC-056: Lab Pace Tracker Panel — 2 Field Mismatches, Progress Bars Always Zero

**Severity**: P1
**Flow**: Season Pace panel in Lab (related to flow 37 area)
**Found**: Session 50 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-052 (same pattern — Lab panel uses different field names from API)

## Description

The Season Pace Lab panel in lab-panels.js uses different field names from what the `/api/pace-tracker` API returns. Player cards render but milestone progress bars all show 0% and no pace badges appear, because the panel reads undefined fields.

### 2 Field Mismatches

| # | Frontend (lab-panels.js) | API returns | Line | Impact |
|---|---|---|---|---|
| 1 | `p.projections` (line 5053) | `p.milestones` | 5053 | Stats loop iterates empty array — no milestones shown |
| 2 | `s.milestone` (line 5055) | `s.target` | 5055 | Progress bar pct always 0 (even if projections were populated) |

### What the User Sees

Player cards render with name/position/team, but the milestone section (projected stats, progress bars, ON/OFF PACE badges) is completely empty because `p.projections || []` evaluates to `[]`.

### Code vs API

```javascript
// lab-panels.js:5053-5056
var stats = p.projections || [];  // API returns: p.milestones → undefined → []
stats.forEach(function(s) {
    var pct = s.milestone ? Math.min(100, ((s.projected || 0) / s.milestone) * 100) : 0;
    //         ^^^^^^^^^^ API returns: s.target
    var onPace = pct >= 100;
```

### API Response (McCaffrey example)

```json
{
    "milestones": [                  // frontend reads: projections (undefined)
        {
            "label": "1,000 Rush Yd",
            "target": 1000,          // frontend reads: milestone (undefined)
            "current": 1202.0,
            "projected": 1201.9,     // matches frontend
            "on_pace": true,
            "pct": 100
        }
    ]
}
```

### Standalone pace.html Works Correctly

The standalone page (pace.html:501, 518) uses the correct field names:
```javascript
var ms = p.milestones || [];      // ✓ correct
// ...
m.target                          // ✓ correct
```

## Fix

```javascript
// lab-panels.js:5053
- var stats = p.projections || [];
+ var stats = p.milestones || [];

// lab-panels.js:5055
- var pct = s.milestone ? Math.min(100, ((s.projected || 0) / s.milestone) * 100) : 0;
+ var pct = s.target ? Math.min(100, ((s.projected || 0) / s.target) * 100) : 0;
```

## Verification

1. Open Lab → click "Pace Tracker" in sidebar
2. Player cards should show milestone progress bars (e.g., "1,000 Rush Yd: 1202 → 1202")
3. Progress bars should show fill percentage with ON/OFF PACE badges
4. Compare with standalone pace.html — data should match
