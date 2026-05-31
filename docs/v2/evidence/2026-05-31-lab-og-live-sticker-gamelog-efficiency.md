# Evidence — lab-og-live-sticker-gamelog-efficiency

**Cycle:** 129 | **Content commit:** 72af0cb6 | **Date:** 2026-05-31

## Gate C — OG PNG curl (force_demo=1)

```
gamelog 200 60634
efficiency 200 65762
```

Sticker labels (source): `LIVE · game weeks`, `LIVE · PPO board` via `launch10LiveStickerLabel`.

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 59 passed, 5 skipped
