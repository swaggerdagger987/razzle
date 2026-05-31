# Evidence — Lab L5 OG position on trade values

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues`  
**Verdict:** PASS

## Gate C (curl)

```bash
curl -s -o /tmp/og-tradevalues-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# 200 51115
```

## Commands

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test pytest apps/api/tests -q` — 51 passed, 5 skipped
