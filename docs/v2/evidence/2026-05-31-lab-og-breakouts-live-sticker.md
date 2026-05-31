# Evidence — lab-og-breakouts-live-sticker

**Date:** 2026-05-31  
**Route:** `/og/breakouts?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/breakouts?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 59 passed, 5 skipped |
| curl breakouts OG | `200 67621` |
| PNG | 1200×630, ≥40KB |

## Notes

- `launch10LiveStickerLabel("breakouts")` → `LIVE · RBS breakout board` (matches `rbs_score` sort key).
- Demo path unchanged: terracotta `SAMPLE · not live data` when API empty.
