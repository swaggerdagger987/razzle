# Evidence — ProGate tradevalues + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Slice:** Lab L4 — shared pro-gate error surface atom 2/3

## Build / tests

| Command | Result |
|---------|--------|
| `JWT_SECRET=test pytest apps/api/tests/test_panel_pro_gate_surface.py -q --noconftest` | 4 passed |
| `npm run build --workspace=apps/web` | exit 0 |

## Change

`TradeValuesRenderer` and `EfficiencyRenderer` route 402/upgrade errors through `ProGateFromPanelError` instead of duplicated `ProUpgradeGate` branches (matches breakouts).

## Verdict

PASS — no OG curl required (no share-card paths touched).
