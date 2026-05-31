# Evidence — Lab L4 Pro gate perks copy (2026-05-31)

**Atom:** `lab-pro-gate-perks-copy`  
**Files:** `apps/web/lib/panel-upgrade-teaser.ts`, `apps/web/components/lab/ProUpgradeGate.tsx`  
**Content commit:** `05a6dc12`

## Claim

Pro upgrade gate perks bullet lists every Launch-10 staff-pick panel title and Bureau-7 tab label (not generic "trade values, breakouts").

## Verification

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q
npm run build --workspace=apps/web
```

## Verdict

**PASS** — 5 pytest passed; web build exit 0.
