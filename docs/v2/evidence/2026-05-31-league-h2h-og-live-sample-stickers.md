# Evidence — league-h2h-og-live-sample-stickers

**Date:** 2026-05-31  
**Atom:** `league-h2h-og-live-sample-stickers`  
**Route:** `/og/head-to-head`

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 74931 bytes (≥40KB) |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
# 200 74931
```

Demo path (no league params) shows terracotta **SAMPLE · demo rivalry rows** sticker.  
Live path shows teal **LIVE · Sleeper rivalry** when API returns you/them.

## Tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests -q` — 55 passed

**Reality:** PASS
