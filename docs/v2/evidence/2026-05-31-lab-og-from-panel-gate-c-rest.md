# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-gate-c-rest` — pytest guards all Launch-10 slugs for FROM PANEL snapshot sticker  
**Trust:** T5, T6

## Build

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0
```

## Contract

- `apps/api/tests/test_og_from_panel_sticker.py` — `LAUNCH_10_OG_SLUGS` tuple mirrors `route.tsx` registry (weekly, prospects, dashboard, rankings, tradevalues, breakouts, gamelog, efficiency, aging, buysell).
- Route unchanged: `isSnapshot && LAUNCH_10_OG_SLUGS.has(slug)` still renders `FROM PANEL · your rows` with trust blue `#5b7fff`.

## Verdict

PASS — static Gate C guard extended from rankings/weekly only to full Launch-10; web build green.
