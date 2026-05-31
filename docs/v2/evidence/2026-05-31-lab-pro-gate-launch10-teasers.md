# Evidence — Lab L4 launch-10 pro gate teasers audit

**Cycle:** 116 (workday cycle 1)  
**Slice:** `lab-pro-gate-launch10-teasers`  
**Date:** 2026-05-31

## Acceptance

```text
JWT_SECRET=test-secret PYTHONPATH=/workspace python3 -m pytest \
  apps/api/tests/test_panel_upgrade_teaser.py apps/api/tests/test_panels.py -q
→ 12 passed

npm run build --workspace=apps/web
→ exit 0
```

## Change summary

- `panel-upgrade-teaser.ts`: `LAUNCH_10_STAFF_PICK_SLUGS`, `LAUNCH_10_PRO_GATE_SLUGS`, `hasCustomTeaser()`; custom rows+pitches for `weekly`, `prospects`, `dashboard` (Staff Picks gaps).
- `test_panel_upgrade_teaser.py`: regression guard — all launch-10 staff picks + pro/generic gate slugs must have domain teasers (not DEFAULT).

## Gate C

N/A — no OG/export routes touched.

## Verdict

PASS — build + pytest green; all 10 launch Staff Picks and generic pro gates have panel-specific blur previews.
