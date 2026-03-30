---
id: DES-293
title: No preseason/offseason warning — users may think stale data is current
severity: P3
category: UX
page: lab.html
---

## What's Wrong

The Screener shows a data freshness indicator ("⏱ 5s ago") based on when the last API fetch happened, but there's no indicator when the underlying NFL data is inherently stale. During the offseason (Feb-Aug) or preseason, users see "⏱ 2s ago" and may think they're getting fresh data — but the stats haven't changed in months.

Similarly, when viewing a past season (e.g., 2024), there's no visual cue that this is historical data, not the current season.

## Where

- `frontend/lab.js` line ~3193-3201: `_lastFetchTime` tracking and display
- No existing logic checks whether the data season is current or past

## Fix

Add a context badge next to the result count:
- **Offseason** (Feb-Aug): "📅 Offseason — 2025 data" in `var(--ink-light)` + Caveat font
- **Past season selected**: "📅 2024 Season" badge when `state.season` is not current year
- **Current season, in-season**: No badge needed (default)

Keep it subtle — a small Caveat annotation, not an alert. Trust the user but give them context.

## Evidence

The `_lastFetchTime` display (⏱ Xs ago) only measures API response time, not data currency. `state.season` exists and can be compared to the current NFL season. No existing code warns about data staleness.
