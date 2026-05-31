# Evidence — Lab L4 ProGateFromPanelError tradevalues + efficiency (2026-05-31)

**Atom:** `lab-l4-pro-gate-error-tradevalues`  
**Bonus:** sharpened rankings/tradevalues/breakouts upgrade pitches in `panel-upgrade-teaser.ts`

## Change

- `TradeValuesRenderer.tsx` / `EfficiencyRenderer.tsx` — shared `ProGateFromPanelError` for 402 paths.
- `panel-upgrade-teaser.ts` — moat-specific pitch copy on three pro panels.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py apps/api/tests/test_panel_upgrade_teaser.py -q
# 9 passed
```

## Verdict

**PASS** — Gate C N/A (no OG).
