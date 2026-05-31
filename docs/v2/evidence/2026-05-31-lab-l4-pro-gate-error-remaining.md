# Lab L4 — ProGateFromPanelError remaining (gamelog, rankings, buysell)

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-remaining` (partial — 3/5 launch-10 inline gates)  
**Trust:** T2, T6

## Claim

Wire shared `ProGateFromPanelError` on `GamelogRenderer`, `DynastyRankingsRenderer`, and `BuySellRenderer`.

## Evidence

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 9 passed

npm run build --workspace=apps/web
# exit 0
```

## Files

- `apps/web/components/lab/renderers/GamelogRenderer.tsx`
- `apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx`
- `apps/web/components/lab/renderers/BuySellRenderer.tsx`
- `apps/api/tests/test_panel_pro_gate_surface.py` (guard test)

## Next tick

AgingCurves + DynastyComps still use inline `ProUpgradeGate`.
