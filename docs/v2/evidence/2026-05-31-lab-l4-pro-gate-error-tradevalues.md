# Evidence — Lab L4 pro-gate tradevalues + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Trust:** T2, T6

## Change

- `TradeValuesRenderer.tsx` — uses `ProGateFromPanelError` (removes duplicated gate branches).
- `EfficiencyRenderer.tsx` — uses `ProGateFromPanelError`.
- `test_panel_pro_gate_surface.py` — wiring guards for tradevalues + efficiency.

## Commands

```bash
npm run build --workspace=apps/web
# exit 0

JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 9 passed
```

## Verdict

**PASS** — no OG route; build + pytest only.
