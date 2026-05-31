# Evidence — Lab L4 pro-gate error surface (remaining launch-10)

**Cycle:** 131  
**Atom:** `lab-l4-pro-gate-error-remaining`  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 14 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

- `ProGateFromPanelError` wired on rankings, gamelog, buysell, aging, prospects (DynastyComps) renderers.
- Pytest guards assert no inline `ProUpgradeGate` in those five files.

## Trust

- T2 — consistent upgrade UX on all launch-10 staff-pick panels.
- T6 — pytest surface prevents gate drift.
