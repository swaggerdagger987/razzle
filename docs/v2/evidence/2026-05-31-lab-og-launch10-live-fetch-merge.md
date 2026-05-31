# Evidence — lab-og-launch10-live-fetch-merge

**Date:** 2026-05-31  
**Atom:** `lab-og-launch10-live-fetch-merge`  
**Epic:** Lab L5 — OG live fetch + sticker parity (atom 1/3)  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test pytest apps/api/tests -q
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/rankings?download=1'
curl -s -o /tmp/weekly-og.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/weekly?download=1'
file /tmp/rankings-og.png /tmp/weekly-og.png
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 58 passed, 5 skipped |
| curl rankings | `200 62355` |
| curl weekly | `200 66512` |
| PNG | 1200×630, ≥40KB both |

## Notes

- Unified route: base `launch10LiveStickerLabel` + branch `fetchOgLiveRows`, prospects `items[]`, gamelog `weeks[]`.
- Dedup: sticker shipped on base (`5bb77346`); this atom merges no-snapshot live fetch with sticker UX.
