# Evidence — Lab L4 pro-gate error surface

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-surface`  
**Trust:** T2, T6

## Change

- `ProGateFromPanelError.tsx` — single mapping from 402 upgrade payload / `UpgradeRequiredError` → `ProUpgradeGate`.
- `BreakoutsRenderer.tsx` — uses shared helper (removes duplicated gate branches).
- `test_panel_pro_gate_surface.py` — launch-10 + Bureau-7 perk slug guards; breakouts wiring check.

## Commands

```bash
npm run build --workspace=apps/web
# exit 0

JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 7 passed
```

## Verdict

**PASS** — no OG route; build + pytest only.
