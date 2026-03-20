---
id: FUNC-003
severity: P2
flow: 18 (Dynasty Rankings), 19 (Trade Values)
status: OPEN
file: backend/live_data/dynasty.py
function: dynasty_value calculation
created: 2026-03-20
---

# P2: Dynasty values cluster at 100.0 ceiling — too many elite players tied

## What's happening

The top 7 players in dynasty rankings all have dynasty_value = 100.0:
- Puka Nacua (WR, 24.8)
- Jaxon Smith-Njigba (WR, 24.1)
- Bijan Robinson (RB, 24.1)
- Jahmyr Gibbs (RB, 24.0)
- Devon Achane (RB, 24.4)
- Ja'Marr Chase (WR, 26.0)
- Rashee Rice (WR, 25.9)

## Why this matters

When a dynasty manager is deciding between Puka Nacua and Devon Achane in a trade, the tool says they're equal value (100.0 = 100.0). Real dynasty markets have clear separation: Puka would be worth more than Achane in most leagues because WR1s are more stable than RB2s.

Flattening the top end makes the trade values less useful for actual decisions. KeepTradeCut-style tools differentiate the top 20+ players.

## Suggested fix

Instead of capping at 100, normalize the scale so the #1 player is ~100 and there's meaningful spread across the top 20:
- Option A: Use a wider scale (0-10000 like KTC) with more granularity
- Option B: Apply a logarithmic or power transformation that preserves differences at the top
- Option C: Cap at 100 but use more decimal precision (100.0, 99.2, 98.8, etc.)

## Not blocking

This doesn't produce wrong answers — the ranking ORDER is correct. It just reduces differentiation at the top. P2 because it's annoying but not trade-ruining.
