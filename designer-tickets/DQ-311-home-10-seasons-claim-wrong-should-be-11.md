---
id: DQ-311
title: Home page claims "10 seasons" but data covers 11 seasons (2015-2025)
priority: P1
category: content-accuracy
page: index.html
---

## Problem
Home page says "10 seasons deep" (line 695) and "10 seasons of data" (line 797). Data actually covers 2015-2025 = 11 seasons (confirmed in PROGRESS.md Phase 29: "2015-2025 range, 54K player_week_stats").

Factual error on the front door. A visitor who checks will see we can't count our own data.

## Expected
Both instances should say "11 seasons" or "10+ seasons" (future-proof).

## Fix
- `frontend/index.html` line 695: change "10 seasons deep" to "11 seasons deep"
- `frontend/index.html` line 797: change "10 seasons of data" to "11 seasons of data"

Two string replacements. 30 seconds.
