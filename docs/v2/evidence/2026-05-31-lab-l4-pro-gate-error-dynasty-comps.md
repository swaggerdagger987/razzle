# Evidence — Lab L4 pro-gate error surface (dynasty comps)

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-dynasty-comps`  
**Verdict:** PASS

## Change

- `DynastyCompsRenderer.tsx` — replace duplicated `ProUpgradeGate` branches with `ProGateFromPanelError`.
- `test_panel_pro_gate_surface.py` — guard dynasty-comps wiring.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py -q
→ 9 passed
```

## Reality

Last Lab renderer with inline 402 gate duplication now shares the L4 upgrade mapper; pro-gate error-surface epic complete.
