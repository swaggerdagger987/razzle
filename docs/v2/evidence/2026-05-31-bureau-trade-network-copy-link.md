# Evidence — Bureau Trade Network copy link

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`  
**Verdict:** PASS

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-trade-network.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/trade-network?download=1&league=test'
# 200 68090 — PNG 1200×630
```

PASS — Trade Network footer has copy link + export card; OG unchanged and ≥40KB.
