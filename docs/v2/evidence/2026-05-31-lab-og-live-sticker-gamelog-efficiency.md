# Evidence — lab-og-live-sticker-gamelog-efficiency

**Cycle:** 132 | **Date:** 2026-05-31

## Gate C — OG PNG curl (force_demo=1)

```
gamelog 200 60634
efficiency 200 65762
```

Both PNG 1200×630, ≥40KB.

## Acceptance

- `npm run build --workspace=apps/web` — PASS (exit 0)
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 68 passed; 3 failed + 2 errors (screener snapshot drift, pre-existing on base)

## Slice

Gamelog LIVE sticker/blurb: `game log` → `Wk tape` to match in-panel Game Log vocabulary. Efficiency already `LIVE · PPO board` on base.
