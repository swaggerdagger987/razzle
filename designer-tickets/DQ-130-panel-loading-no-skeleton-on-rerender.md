# DQ-130: Lab panels show no skeleton/placeholder when switching — content blinks to empty

**Priority**: P2 — MEDIUM
**Category**: UX / Perceived Performance
**Scope**: frontend/lab-panels.js

## Problem

When a user switches between Lab panels (sidebar navigation), the panel container is cleared to empty before the new panel's fetch begins. This creates a visible flash:

1. User is viewing Dynasty Rankings (fully rendered table)
2. Clicks "Trade Values" in sidebar
3. Panel area goes completely blank
4. "pulling film..." text appears (sometimes a frame later)
5. Content loads and renders

The blank flash between step 2 and 4 feels jarring. There's no transition, skeleton loader, or fade between panels.

## Impact

- Perceived performance feels slower than actual (user sees empty space)
- Contrast with the Lab screener itself, which has proper skeleton cells during data loading
- On slow connections, the blank state can last 1-3 seconds

## Fix

Before clearing panel content, insert a skeleton placeholder immediately:

```js
function showPanelSkeleton(container) {
  container.innerHTML = '<div class="panel-skeleton">' +
    '<div class="skeleton-cell" style="width:60%;height:24px;margin-bottom:12px"></div>' +
    '<div class="skeleton-cell" style="width:100%;height:200px"></div>' +
    '<div class="skeleton-cell" style="width:80%;height:16px;margin-top:8px"></div>' +
    '</div>';
}
```

The .skeleton-cell class already exists in styles.css (from Phase 97). Reuse it. Show skeleton immediately on panel switch, replace with real content when fetch resolves.
