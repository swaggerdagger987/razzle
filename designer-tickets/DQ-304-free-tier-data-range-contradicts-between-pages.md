---
id: DQ-304
title: Free tier data range contradicts between pricing and agents pages
priority: P1
category: content-contradiction
page: pricing.html, agents.html
---

## Problem
The free tier historical data claim is inconsistent across pages:
- **pricing.html (~line 258)**: Free tier gets "10 seasons of data"
- **agents.html feature table (~line 2010-2013)**: Shows "historical data (all 2015+)" for ALL tiers including Free
- **pricing.html feature matrix (~line 358-360)**: Shows "All (2015+)" for ALL tiers including Free

This means a free user sees "I get all data since 2015" on two pages but "only 10 seasons" on one. The matrix on pricing.html contradicts its own plan card above it.

## Expected
Consistent data range claims across all pages. If free = 10 seasons, say "10 seasons" everywhere. If free = all 2015+, say that everywhere.

## Fix
1. Decide the real free tier data limit
2. Update pricing.html feature matrix row for "Season selector"
3. Update agents.html feature table row for "historical data"
4. Ensure plan card text matches matrix

## Files
- `frontend/pricing.html` — plan card (~line 258), feature matrix (~line 358-360)
- `frontend/agents.html` — feature table (~line 2010-2013)
