# Evidence — lab-l4-pro-gate-error-tradevalues

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Room:** Lab L4

## Acceptance

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py -q` — 4 passed

## Change

`TradeValuesRenderer` and `EfficiencyRenderer` route 402 / upgrade errors through `ProGateFromPanelError` (same pattern as breakouts). Pytest guards both renderers import the shared gate and no longer inline `ProUpgradeGate`.
