# Evidence — 2026-05-31 — Bureau Trade Finder share bar

**Slice:** League L5 — BureauTradeFinderShareBar copy trade link + OG export  
**Atom:** `bureau-trade-finder-copy-link`

## Gate C

```bash
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-finder?download=1'
file /tmp/og-tf.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 57238 bytes |
| Format | PNG 1200×630 |

## Verdict

PASS — Trade Finder hero section now has copy trade link + export card via `BureauTradeFinderShareBar`, mirroring H2H / Monte Carlo share rows.
