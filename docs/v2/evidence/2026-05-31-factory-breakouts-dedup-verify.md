# Evidence — Factory cycle 97 breakouts OG dedup verify

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked` (dedup on base `3425f207`)

## Gate C

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&position=WR'
# 200 61718
```

**Verdict:** PASS — breakouts OG ranked export already on base; factory verifies without duplicate code.
