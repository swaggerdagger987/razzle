# Evidence — lab-og-live-sticker-tradevalues-aging

**Atom:** `lab-og-live-sticker-tradevalues-aging`  
**Pillar:** Lab L5  
**Trust:** T5, T6

## Change

- Pytest asserts `LIVE · trade values` and `LIVE · aging curve` stickers + blurb suffixes in OG route (atom 1 route already names slugs).

## Commands

```bash
JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests/test_og_launch10_live_sticker.py -q
npm run build --workspace=apps/web
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1'
curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/aging?download=1'
```

## Results

| Route | curl |
|-------|------|
| `/og/tradevalues?download=1` | `200 68974` |
| `/og/aging?download=1` | `200 65088` |

**Verdict:** PASS
