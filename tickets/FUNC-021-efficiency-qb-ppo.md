# FUNC-021: Efficiency Rankings PPO metric broken for QBs

## Severity: P1

## Summary
The "Most Efficient" section of the Efficiency Rankings panel (`/api/efficiency-rankings`) is dominated by QBs with inflated PPO (Points Per Opportunity) values because the `opportunities` calculation only includes `targets + carries` — which for QBs means only rushing carries. QB fantasy points (from passing yards, passing TDs) are divided by only their rushing touches, producing absurd PPO values (3-6x) versus skill positions (0.7-1.1x).

## Evidence
```
=== MOST EFFICIENT (Top 10 — ALL QBs) ===
Dak Prescott              QB   PPO=5.92  (53 rushes, 32 TDs including passing)
Baker Mayfield            QB   PPO=4.94  (55 rushes)
Patrick Mahomes           QB   PPO=4.40  (65 rushes)
Trevor Lawrence           QB   PPO=4.12  (82 rushes)
Bryce Young               QB   PPO=4.04  (54 rushes)

=== VOLUME KINGS (correctly all RBs) ===
Christian McCaffrey       RB   PPO=0.95  (440 opportunities)
Bijan Robinson            RB   PPO=0.95  (390 opportunities)
```

No fantasy football user would consider Dak Prescott or Bryce Young the most efficient players in football. A dynasty vet seeing this would immediately distrust the tool.

## Root Cause
`backend/live_data/dashboards.py:118-119`:
```python
# Opportunities = targets + carries (for QBs: attempts/carries)
opportunities = targets + carries
```
The comment acknowledges QBs need different logic but the code doesn't implement it. The SQL query (line 62-89) fetches `passing_tds` but not `attempts` (pass attempts), so even if the code tried to split by position, it lacks the data.

Additionally, `td_rate` (line 133) divides ALL TDs (including passing) by only rushing touches, showing 60%+ TD rates for QBs.

## Comparison
The TD Regression panel (`tools.py:2207-2210`) correctly handles this:
```python
if pos == 'QB':
    opportunities = pass_att + carries
else:
    opportunities = carries + targets
```

## Fix Options
1. **Add pass attempts to query + split by position** (preferred): Add `SUM(s.attempts) as pass_attempts` to the SQL, then use `pass_attempts + carries` for QBs.
2. **Exclude QBs from efficiency rankings**: The opportunity model doesn't apply to QBs.
3. **Default position filter to RB**: The frontend has position tabs (All/QB/RB/WR/TE) — default to RB instead of All.

## Files
- `backend/live_data/dashboards.py:42-177` (fetch_efficiency_rankings)
- `frontend/efficiency.html` (has position tabs, defaults to "All")
- `frontend/lab-panels.js` (lab panel version)

## Affects
- Efficiency Rankings standalone page
- Efficiency Rankings Lab panel
- Report Card panel (uses efficiency grade from same formula)
