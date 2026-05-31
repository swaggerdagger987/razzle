# Evidence — Bureau Trade Network copy link

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`

## Gate C2

```bash
curl -s -o /tmp/og-tn.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?download=1&league=test'
```

| Result | Value |
|--------|-------|
| HTTP | 200 |
| Size | 68090 bytes |
| Format | PNG 1200×630 |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests -q` — 52 passed; 2 screener snapshot errors pre-existing on base (unrelated to slice)

## Verdict

**PASS**
