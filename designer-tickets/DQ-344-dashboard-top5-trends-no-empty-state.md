---
id: DQ-344
title: Dashboard top5 and trends sections render blank when API returns empty data
priority: P2
category: UX / empty states
page: dashboard.html
cycle: 45
---

## Problem

The dashboard page's `renderTop5()` and `renderTrends()` functions have no empty state handling. If `d.top5` is an empty array or `d.trends` is an empty object, the sections render blank with no explanation:

```javascript
// Line 485-497: renderTop5 iterates without checking length
function renderTop5(top5) {
    var html = '<div class="db-top5">';
    top5.forEach(function(p, i) { ... });  // empty array = empty div
    html += '</div>';
    document.getElementById('db-top5-wrap').innerHTML = html;
}
```

By contrast, the Risers/Fallers/Value Picks sections DO have empty state fallback text ("no risers found").

## Expected

When top5 is empty: show "no data available for this season" in the db-top5-wrap container.
When trends is empty: show a similar message instead of blank cards with 0/NaN values.

## Fix

Add empty state check at the top of each function:
```javascript
function renderTop5(top5) {
    if (!top5 || top5.length === 0) {
        document.getElementById('db-top5-wrap').innerHTML =
            '<div style="text-align:center; padding:24px; font-family:var(--font-hand); color:var(--ink-light);">no top 5 data for this season</div>';
        return;
    }
    // ... existing code
}
```

## Files
- `frontend/dashboard.html` (lines 485-497, 499-513)
