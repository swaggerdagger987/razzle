# Evidence — lab-pro-gate-perks-copy (2026-05-31)

## Slice

Pro gate perks list uses PARITY Launch-10 panel titles (`@razzle/panels` via `launch10PerkLabels`) and Bureau-7 tab labels (`BUREAU_7_SLUGS` + `bureau7PerkLabels`).

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q
# 6 passed

npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — no OG route changes; conversion copy aligned with landing/pricing moat framing.
