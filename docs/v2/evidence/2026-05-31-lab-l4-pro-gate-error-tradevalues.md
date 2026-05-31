# Evidence — Lab L4 ProGate tradevalues + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-tradevalues`

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 8 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

- `TradeValuesRenderer.tsx` + `EfficiencyRenderer.tsx` use `ProGateFromPanelError` (matches breakouts on base).
- `test_panel_pro_gate_surface.py` guards wiring for both renderers.

## Verdict

**PASS** — shared pro-gate error surface on tradevalues + efficiency; build + pytest green.
