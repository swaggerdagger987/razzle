---
id: DQ-419
title: Pricing feature matrix "Generic AI queries" row doesn't explain what "generic" means
priority: P2
category: copy / conversion
page: pricing.html
cycle: 53
---

## Problem

The pricing feature matrix has a row: "Generic AI queries: Free=5/day, Pro=20/day, Elite=Unlimited". The word "generic" is developer jargon. A visitor reading this doesn't understand:

1. What "generic" means (no league data? less accurate?)
2. What the alternative is (league-contextualized?)
3. Why Free users get "generic" while Pro/Elite get something else

This is distinct from DQ-307 (agents page "generic mode" jargon) — this is specifically the pricing feature comparison matrix, which is the most critical conversion surface.

## Evidence

pricing.html feature matrix row (~line 371):
```
Generic AI queries | 5/day | 20/day | Unlimited
```

No tooltip, no footnote, no clarifying text.

## Fix

Rename the row and add clarity:
```
AI queries (without league data) | 5/day | — | —
AI queries (with YOUR league data) | — | 20/day | Unlimited
```

Or simpler: rename to "AI queries" and add a footnote: "Free tier: general fantasy advice. Pro/Elite: personalized analysis using your league's rosters, scoring, and rivals."

## Files
- `frontend/pricing.html` — feature matrix (~line 371)
