# Evidence — Lab L5 prospects OG live #rank labels

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-live-tiers`  
**Slice:** `#rank` statLabel on live prospects OG (RPS sort on base)

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?position=WR&download=1` | 200 | 51431 | PNG 1200×630 |

```bash
curl -s -o /tmp/og-prospects-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?position=WR&download=1'
```

**Verdict:** PASS — incremental rank labels on existing live prospects extract.
