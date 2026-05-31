# Evidence — Bureau Trade Finder OG snapshot

**Date:** 2026-05-31  
**Atom:** `bureau-trade-finder-og-snapshot`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-finder?download=1&league=test&user=test&snapshot=<encoded>'
file /tmp/og-tf.png
```

## Results

- Snapshot curl: **200**, **57773** bytes, PNG 1200×630
- Blurb: `from your panel` when snapshot param present

## Change

`BureauTradeFinder` passes top matches into `BureauTradeFinderShareBar`; OG route decodes `snapshot` before live API.
