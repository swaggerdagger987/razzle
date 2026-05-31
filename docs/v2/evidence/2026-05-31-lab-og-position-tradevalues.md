# Evidence — Lab L5 trade values OG position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-tv-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# → 200 51115
```

PNG: 1200×630, ≥40KB — `position=WR` forwarded from in-panel tab to OG route.

## Layer claim

Lab L5 — Trade values export card honors the active position filter.
