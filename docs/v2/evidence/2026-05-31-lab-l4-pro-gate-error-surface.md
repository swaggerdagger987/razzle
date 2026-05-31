# Evidence — lab-l4-pro-gate-error-surface (2026-05-31)

## Slice

`ProGateFromPanelError` on breakouts renderer + pytest guard for shared 402 surface.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 7 passed
```

## Files

- `apps/web/components/lab/ProGateFromPanelError.tsx` — shared 402 → ProUpgradeGate mapper
- `apps/web/components/lab/renderers/BreakoutsRenderer.tsx` — uses ProGateFromPanelError
- `apps/api/tests/test_panel_pro_gate_surface.py` — wiring guard

## Trust

T2 (pro gate clarity), T6 (voice/consistency on upgrade path)
