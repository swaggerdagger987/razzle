# Evidence — Bureau Trade Network copy link (2026-05-31)

**Atom:** `bureau-trade-network-copy-link`  
**Files:** `BureauTradeNetworkShareBar.tsx`, `BureauTradeNetwork.tsx`

## Gate C — curl

```text
curl -s -o /tmp/og-tn.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/trade-network?download=1&league=test'
200 68090
file /tmp/og-tn.png: PNG 1200x630
```

## Build

```text
npm run build --workspace=apps/web — exit 0
```

## Verdict

**PASS** — share row mirrors Power Rankings; OG ≥40KB.
