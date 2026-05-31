# Evidence — Lab L4 percentiles Pro teaser (2026-05-31)

**Atom:** `lab-l4-percentiles-pro-teaser`  
**Cycle:** 123

## Change

`apps/web/lib/panel-upgrade-teaser.ts` — `percentiles` in `ROWS_BY_SLUG` + `PITCH_BY_SLUG`.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test PYTHONPATH=/workspace python3 -m pytest apps/api/tests -q  # 59 passed (1 snapshot drift pre-existing on dynasty top-30)
```

## Verdict

PASS
