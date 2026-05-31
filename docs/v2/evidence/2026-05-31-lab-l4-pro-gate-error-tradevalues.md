# Evidence — Lab L4 pro-gate tradevalues + efficiency

**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Date:** 2026-05-31

## Change

- `TradeValuesRenderer` and `EfficiencyRenderer` use `ProGateFromPanelError` (same pattern as breakouts).
- `test_panel_pro_gate_surface.py` guards tradevalues + efficiency wiring.

## Commands (executed)

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 8 passed

npm run build --workspace=apps/web
# exit 0
```

## Reality

PASS — no OG route in slice; build + pytest only.
