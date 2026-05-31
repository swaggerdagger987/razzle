# Evidence — lab-og-efficiency-live-extract

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-live-extract` — Efficiency OG reads `most_efficient` + `volume_kings` lanes.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

- `extractEfficiencyRows` maps Efficiency API shape (Eff/Vol lanes) with `formula_score` before `ppo`.
- `extractRows` short-circuits `slug === "efficiency"` before generic candidate parsing.

## Verdict

PASS — T5 live OG rows match in-product efficiency board shape; pytest + web build green.
