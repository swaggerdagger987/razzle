# Evidence — league-trade-finder-og-preview-link

**Atom:** `league-trade-finder-og-preview-link` — Bureau Trade Finder share bar copies OG preview URL + preview card tab.

## Gate C

```bash
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-finder?download=1'
file /tmp/og-tf.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 57910 bytes |
| Format | PNG 1200×630 |

## Tests

```bash
pytest apps/api/tests/test_trade_finder_og_preview_link.py \
  apps/api/tests/test_trade_finder_og_snapshot.py -q
# 5 passed
npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — Trade Finder GTM epic atom 3/3: `copy card link` + `preview card` on share bar; export still uses `download=1`.
