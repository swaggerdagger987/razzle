# Evidence — Lab L4 pro-gate tradevalues + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Trust:** T2, T6

## Change

- `TradeValuesRenderer.tsx` — `ProGateFromPanelError` replaces duplicated `ProUpgradeGate` branches.
- `EfficiencyRenderer.tsx` — same shared helper.
- `test_panel_pro_gate_surface.py` — guards tradevalues + efficiency wiring (no inline `ProUpgradeGate`).

## Commands

```bash
npm run build --workspace=apps/web
# exit 0

JWT_SECRET=test pytest apps/api/tests/test_panel_pro_gate_surface.py -q
# 4 passed
```

## Verdict

**PASS** — no OG route; build + pytest only.
