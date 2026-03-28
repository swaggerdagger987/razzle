---
id: S3-089
severity: S3
confidence: LOW
category: feature-request
source: BUG-006
status: OPEN
---

# Trade Values page formula not adjustable — fixed weights (50/30/20)

## Root Cause

The trade value computation uses a fixed formula: production 50% + age 30% + positional scarcity 20%. Users cannot adjust these weights to match their league's priorities (e.g., a dynasty league might weight age at 50%).

## Fix

Add weight sliders to `frontend/tradevalues.html`:
- Production weight (0-100%)
- Age weight (0-100%)
- Scarcity weight (0-100%)
- Auto-normalize to 100% total

Recompute values client-side on slider change, or pass weights to API.

## Files

- `frontend/tradevalues.html` — add sliders UI
- Backend trade value endpoint — accept weight params (optional)

## Acceptance Criteria

- Users can adjust trade value formula weights
- Values update in real-time as sliders move
- Defaults match current 50/30/20 split
