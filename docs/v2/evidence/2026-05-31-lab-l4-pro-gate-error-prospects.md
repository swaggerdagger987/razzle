# Evidence — lab-l4-pro-gate-error-prospects (2026-05-31)

**Atom:** ProGateFromPanelError on prospects (weekly already on base)  
**Cycle:** 157

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_pro_gate_surface.py -q --noconftest
# 10 passed

npm run build --workspace=apps/web
# exit 0
```

## Claim

Prospects panel maps 402 upgrade payloads through `ProGateFromPanelError` so Hawkeye prospect
board hits show catalog perks instead of raw API errors. Weekly already wired on base.

## Trust

T2, T6
