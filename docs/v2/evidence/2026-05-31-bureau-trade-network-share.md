# Evidence — Bureau Trade Network share row

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-share`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Route

- `GET /og/trade-network?league=<id>&download=1` (existing)
- Share row: `apps/web/components/league/BureauTradeNetwork.tsx` — `copy network link` + `export card` in header

## curl (local dev, demo params)

```text
curl -s -o /tmp/og-tn.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-network?league=demo&download=1'
→ 200 68199
file /tmp/og-tn.png → PNG 1200×630
```

Demo partnership rows render when API empty (Bones diplomat card).

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
