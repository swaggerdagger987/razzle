# Evidence — Bureau Trade Network copy link export row

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`  
**Gate:** FACTORY-DOD C2/C3

## Change

- `BureauTradeNetworkShareBar.tsx`: copy link + export card row.
- `BureauTradeNetwork.tsx`: footer uses share bar (mirrors Monte Carlo / Pressure Map).

## Verification

```bash
curl -s -o /tmp/og-tn.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?league=test&download=1'
file /tmp/og-tn.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 68090 bytes (≥40KB) |
| Format | PNG 1200×630 |

```bash
npm run build --workspace=apps/web  # pass — ƒ /og/trade-network
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

**Verdict:** PASS — FACTORY-DOD Gate C2 satisfied.
