# Evidence — Lab weekly pro export gate

**Date:** 2026-05-31  
**Atom:** `lab-pro-weekly-paywall-copy`  
**Verdict:** PASS

## Change

- `panel-upgrade-teaser.ts`: Hawkeye streak preview rows + pitch for `weekly` / `weeklyleaders`.
- `WeeklyHeatmapRenderer.tsx`: 402 → `ProUpgradeGate`; free plan export click opens gate with hallway CTA.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
PYTHONPATH=/workspace python3 -m pytest apps/api/tests/test_panels.py::test_pro_panel_returns_402_on_free_plan -q
# 1 passed
```

## UX note

Free users keep full weekly heatmap; **export card (Pro)** triggers upgrade gate instead of generic error.
