---
id: DQ-438
priority: P3
area: frontend/lab.js
section: data freshness / UX
type: missing visual feedback
status: open
cycle: 56
---

# Data freshness indicator has no visual warning for stale data (30+ minutes)

## What's wrong

The data freshness indicator (lab.js:3192-3201) shows elapsed time since last fetch:
- "just now" (< 5s)
- "12s ago" (< 60s)
- "5m ago" (>= 60s)

But it uses the same muted `color:var(--ink-light)` style regardless of staleness. A user who left their tab open for 2 hours sees "120m ago" in the same visual weight as "2s ago". There's no threshold where the indicator turns orange or red to signal "your data might be outdated, consider refreshing."

## Where

- `frontend/lab.js:3192-3201` — `_lastFetchTime` display logic in result count area

## Fix

Add a visual threshold:
```js
var agoStyle = '';
if (ago > 3600) agoStyle = 'color:var(--red); font-weight:600;';        // > 1 hour: red
else if (ago > 1800) agoStyle = 'color:var(--orange); font-weight:600;'; // > 30 min: orange
```

Show refresh hint for very stale data:
```
"⏱ 45m ago — data may be stale"
```

## Why this matters

Fantasy football users make time-sensitive decisions. Stale data (e.g., from a tab left open during a Sunday slate) could lead to wrong lineup calls. A visual cue at 30+ minutes prevents this.
