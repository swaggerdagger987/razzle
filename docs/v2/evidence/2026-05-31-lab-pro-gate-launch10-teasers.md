# Evidence — Lab L4 launch-10 pro gate teasers (2026-05-31)

**Atom:** `lab-pro-gate-launch10-teasers`  
**Epic:** Lab L4 — Pro gates feel like upgrade, not error (atom 2/3)

## Change

`apps/web/lib/panel-upgrade-teaser.ts` — `ROWS_BY_SLUG` + `PITCH_BY_SLUG` for Launch-10 gaps: `weekly`, `prospects`, `dashboard`.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 52 passed, 4 failed (screener snapshots — same on clean base)
node -e "… weekly/prospects/dashboard keys …"   # OK launch-10 teasers
```

## Verdict

PASS — Pro gates on `/lab/weekly`, `/lab/prospects`, `/lab/dashboard` show panel-specific blur rows instead of generic Tier 1 defaults.
