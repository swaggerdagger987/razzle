# Evidence — Lab OG gamelog peak weeks by FPTS

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-weeks-fpts-sort`  
**Cycle:** 106

## Changes

- `extractGamelogWeekRows` — sorts `weeks[]` by `fpts` desc, labels `Wk N`, matches `GamelogRenderer` ogSnapshotRows
- Demo rows updated to week-style PPR peaks (not multi-player names)

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed
curl /og/gamelog?download=1&player_id=00-0036900&position=WR  → 200 56390 PNG 1200×630
```

## Gate C

PASS — PNG ≥ 40KB, week rows visible (demo or live).
