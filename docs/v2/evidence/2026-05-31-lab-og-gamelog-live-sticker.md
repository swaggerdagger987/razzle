# Evidence — lab-og-gamelog-live-sticker

**Date:** 2026-05-31  
**Route:** `/og/gamelog?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test ENVIRONMENT=development python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/gamelog?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 62 passed, 5 skipped |
| curl gamelog OG | `200 60634` |
| PNG | 1200×630 |

## Notes

- `launch10LiveStickerLabel("gamelog")` → `LIVE · weeks PPR strip` (was `Wk tape` on base `7207c3f41`).
