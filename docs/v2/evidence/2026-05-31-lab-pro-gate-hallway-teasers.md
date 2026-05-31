# Evidence — Lab L4 pro-gate hallway + teasers

**Cycle:** 115  
**Slice:** `lab-pro-gate-hallway-teasers`  
**Date:** 2026-05-31

## Acceptance

```text
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q
→ 51 passed, 5 skipped

npm run build --workspace=apps/web
→ exit 0
```

## Change summary

- `ProUpgradeGate.tsx`: hallway link `toExplore({})` — "free screener →" on pro gates.
- `panel-upgrade-teaser.ts`: panel-specific blur rows + pitches for `tiers`, `vorp`, `stocks`, `waivers`, `dynasty-comps`.

## Gate C

N/A — no OG/export routes touched.

## Verdict

PASS — build + pytest green; pro gate shows screener exit + domain teasers for generic pro panels.
