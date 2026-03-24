---
id: DQ-360
title: Home page smart filter chips claim "update live" without explaining offseason behavior
priority: P3
category: UX / content clarity
page: index.html
cycle: 46
---

## Problem

The home page smart filter section (around lines 717-726) shows chips like "Breakout Candidates", "Buy Low", "Sell High" with the annotation "These update live as the season plays out."

During the NFL offseason (February-August), these filters may return:
1. Empty results (no current-season data)
2. Stale 2025 season data without any indication it's historical
3. Confusing results for new visitors who think the site is broken

The annotation "update live as the season plays out" implies real-time currency. In March, that's misleading.

## Fix

Add seasonal context to the annotation:

During offseason (detectable via current month):
```
"These track the current NFL season. In the offseason, you'll see last season's final data."
```

Or more simply, make the annotation evergreen:
```
"Powered by real data. Updates weekly during the NFL season."
```

This sets correct expectations year-round without requiring date logic.

## Files
- `frontend/index.html` (smart filter chip section, around lines 717-726)
