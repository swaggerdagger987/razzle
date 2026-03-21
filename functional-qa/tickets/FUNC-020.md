# FUNC-020: Derived column sort returns wrong order on production

## Severity: P1

## Summary
Sorting by derived/rate columns (WOPR, target_share, yards_per_carry, catch_rate, etc.) returns players in default PPR order, NOT sorted by the requested column. The Python re-sort after SQL query is not functioning correctly on production.

## Root Cause
Two issues in the deployed `master` branch players.py:

1. **`sql_limit = 500`**: When sorting by derived columns, SQL fetches only 500 rows sorted by PPR. Python re-sorts these 500 rows, but the top players by the derived metric may not be in this 500-row window. The fix (sql_limit=2000) exists in ship/launch-fixes but is not deployed.

2. **Null sentinel sort**: The deployed code uses `x.get(sort_key) or 0` which treats null/None as 0, mixing null-value players with legitimate 0-value players. The fix uses `float('-inf')`/`float('inf')` sentinels to push nulls to the end.

## Evidence
```
# Production test (2026-03-20):
GET /api/players?limit=5&sort=wopr&direction=desc&season=2025

  Christian McCaffrey - WOPR: 0.41   (PPR: 416.6)
  Puka Nacua - WOPR: 0.709          (PPR: 375.0)
  Bijan Robinson - WOPR: 0.311      (PPR: 370.8)

Expected (descending WOPR): Nacua (0.709) should be FIRST.
Actual: Players in PPR order, not WOPR order.

GET /api/players?limit=5&sort=target_share&direction=desc&position=WR&season=2025

  Puka Nacua - Target Share: 0.311
  Jaxon Smith-Njigba - Target Share: 0.357

Expected: JSN (0.357) before Nacua (0.311).
Actual: PPR order again.
```

## Impact
- Users sorting by derived metrics see misleading results
- "Sort by WOPR" or "Sort by target share" returns PPR order with derived values shown — looks like a broken sort
- Fantasy managers making decisions based on derived metric rankings get wrong player order
- Screener URL shares with derived sort (?sort=wopr) show wrong order to recipients

## Additional Risk
Rapid consecutive derived-sort requests caused a 502 server crash during testing (likely OOM from concurrent enrichment pipelines on Render free tier). Server auto-recovered after ~40 seconds.

## Fix
Deploy ship/launch-fixes to master. Key changes in players.py:
- `sql_limit = 500` → `sql_limit = 2000` (line ~431)
- Null sentinel sort: `float('-inf')` for desc, `float('inf')` for asc (line ~488)
- `total = len(items)` after Python re-sort for correct pagination count

## Related
- FUNC-019 (deployment gap — same root cause: ship/launch-fixes not pushed to master)
