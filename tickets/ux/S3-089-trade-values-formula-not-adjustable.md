---
id: S3-089
severity: S3
confidence: LOW
category: feature-request
source: BUG-006
status: OPEN
---

# Trade Values page formula not adjustable — fixed weights (50/30/20)

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Frontend**: `frontend/tradevalues.html:424` — displays: "composite value: 50% production + 30% age curve + 20% positional scarcity"
**Frontend**: `frontend/tradevalues.html:441-443` — static methodology chips with no input controls (no sliders, no inputs)
**Backend formula**: `backend/live_data/core.py:859` — hardcoded: `raw = prod * 0.50 + age_v * 0.30 + scar * 0.20`
**API endpoint**: `backend/server.py:2800-2810` — `GET /api/trade-value-chart` accepts only `season`, `position`, `limit` — no weight parameters

## Fix

1. `server.py:2800` — Add optional `prod_w`, `age_w`, `scar_w` float params (default 0.50/0.30/0.20)
2. `core.py:859` — Accept weight params in `compute_trade_value()`
3. `tradevalues.html:441-443` — Replace static chips with range sliders, auto-normalize to 100%
4. Recompute on slider change via API call with custom weights

## Files

- `frontend/tradevalues.html:424,441-443` — UI (static chips → sliders)
- `backend/live_data/core.py:859` — formula (hardcoded → parameterized)
- `backend/server.py:2800-2810` — endpoint (add weight params)

## Acceptance Criteria

- Users can adjust trade value formula weights
- Values update in real-time as sliders move
- Defaults match current 50/30/20 split
