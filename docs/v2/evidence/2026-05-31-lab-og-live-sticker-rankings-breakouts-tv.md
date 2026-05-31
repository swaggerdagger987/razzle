# Evidence — lab-og-live-sticker-rankings-breakouts-tv

**Cycle:** 125 | **Content commit:** dec54078 | **Date:** 2026-05-31

## Gate C — OG PNG curl (force_demo=1)

```
rankings 200 67083
breakouts 200 67621
tradevalues 200 68974
```

PNG: 1200×630, all ≥40KB.

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 58 passed, 5 skipped

## Code

`launch10LiveBlurbSuffix` + `launch10LiveStickerLabel` add rankings/breakouts/tradevalues branches.
