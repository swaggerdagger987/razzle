# Evidence — lab-l4-pro-gate-error-rankings-buysell

**Date:** 2026-05-31  
**Atom:** `lab-l4-pro-gate-error-remaining` (rankings + buysell)  
**Trust:** T2, T6

## Change

- `DynastyRankingsRenderer` + `BuySellRenderer` use `ProGateFromPanelError` (matches breakouts/tradevalues).
- `test_pro_gate_from_panel_error_wired_in_rankings_and_buysell` guards wiring.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
pytest test_panel_pro_gate_surface.py test_panel_upgrade_teaser.py → 9 passed
```

## Verdict

PASS — no OG/preview gate (Lab L4 pro-gate only).
