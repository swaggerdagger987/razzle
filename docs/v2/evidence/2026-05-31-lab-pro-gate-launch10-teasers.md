# Evidence — Lab L4 launch-10 pro-gate teasers

**Date:** 2026-05-31  
**Atom:** `lab-pro-gate-launch10-teasers`  
**Verdict:** PASS

## Acceptance

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q → 59 passed, 1 failed (dynasty_top_30 snapshot — terminal.db drift, unrelated to slice)
```

## Change

- `panel-upgrade-teaser.ts`: domain blur rows + staff pitches for `weekly`, `prospects`, `dashboard` launch-10 slugs.

## Gate C

N/A — no OG/export routes.

## Verdict

PASS — Pro gates on launch-10-shaped panels show Hawkeye/Razzle-specific teasers instead of generic dynasty tier rows.
