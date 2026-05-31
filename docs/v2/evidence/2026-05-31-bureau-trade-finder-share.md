# Evidence — Bureau Trade Finder share row

**Date:** 2026-05-31  
**Atom:** `bureau-trade-finder-share`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Route

- `GET /og/trade-finder?league=<id>&user=<id>&download=1` (existing)
- Share row: `apps/web/components/league/BureauTradeFinder.tsx` — `copy finder link` + `export card` in header

## curl (local dev, demo params)

```text
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?league=demo&user=demo&download=1'
→ 200 57813
file /tmp/og-tf.png → PNG 1200×630
```

Demo match rows render when API empty (Bones diplomat card).

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
