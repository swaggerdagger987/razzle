# Evidence — Lab L4 dynasty comps ProGateFromPanelError

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-dynasty-comps`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py -q
# 9 passed
```

## Product

- `DynastyCompsRenderer` uses shared `ProGateFromPanelError` — last launch-10 renderer off duplicated `ProUpgradeGate` branches.
- Pytest guard includes `DynastyCompsRenderer.tsx` in remaining launch-10 parametrized list.
