---
id: FUNC-011
severity: P0
flow: 46 (Draft Class)
status: OPEN
file: backend/live_data/tools.py
function: fetch_draft_class
created: 2026-03-20
---

# P0: Draft class PPG inflated for multi-season players — COUNT(DISTINCT s.week) collapses games across seasons

## What's broken

In `fetch_draft_class()` at tools.py:548, the game count is calculated as:
```sql
COUNT(DISTINCT s.week) as total_games
```

This counts unique week numbers across ALL seasons. A player who played week 1 in 2024 AND week 1 in 2025 gets counted as 1 game for week 1, not 2.

Result: 51 of 77 players in the 2024 draft class have inflated PPG.

## Evidence

```
Bo Nix (2024 Rd1 Pk12):
  total_ppr = 660.2
  games (query) = 20  ← COUNT(DISTINCT week) across 2 seasons
  ppg = 33.01          ← WRONG (implies elite QB)

  Actual games ≈ 33 (16 in 2024 + 17 in 2025)
  Actual PPG ≈ 20.0    ← CORRECT (average rookie QB)

Caleb Williams: 30.57 PPG reported, ~18.5 actual
Jayden Daniels: 25.83 PPG reported, ~12.9 actual
```

## Why this is P0

A dynasty manager seeing Bo Nix at 33 PPG would value him as an elite QB1. His actual ~20 PPG makes him a mid-range QB2. **This directly misleads trade decisions.**

## Fix

Change line 548 from:
```sql
COUNT(DISTINCT s.week) as total_games
```
to:
```sql
COUNT(DISTINCT s.season || '-' || s.week) as total_games
```

Or alternatively:
```sql
COUNT(*) as total_games
```
(if there are no duplicate entries per player+season+week)

## Verification

```bash
curl -s "http://localhost:8000/api/draft-class?year=2024" | python -c "
import json,sys
data=json.load(sys.stdin)
for p in data['players'][:5]:
    print(f'{p[\"name\"]}: total={p[\"total_ppr\"]}, games={p[\"games\"]}, ppg={p[\"ppg\"]}, seasons={p[\"seasons_played\"]}')
    # PPG for 2-season players should be ~12-20, not 25-35
"
```
