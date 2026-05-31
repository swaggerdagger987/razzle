# Evidence — lab-og-live-sticker-rankings-breakouts-tv

**Cycle:** 125 | **Content commit:** ad24a219 | **Date:** 2026-05-31

## Gate C — OG PNG curl (force_demo=1)

```
rankings 200 67083
breakouts 200 67621
tradevalues 200 68974
```

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 58 passed, 5 skipped
