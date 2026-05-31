# Lab L4 — ProGateFromPanelError on remaining launch-10 renderers

**Atom:** `lab-l4-pro-gate-error-remaining`  
**Date:** 2026-05-31

## Change

- `panelApiGet()` in `apps/web/lib/panel-api.ts` — single 402 upgrade payload for all panel fetches.
- All 10 launch-10 staff-pick renderers use `panelApiGet` + `ProGateFromPanelError` (no inline `ProUpgradeGate`).
- `PanelRenderer` generic path uses `ProGateFromPanelError`.

## Evidence

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 19 passed

npm run build --workspace=apps/web
# exit 0
```
