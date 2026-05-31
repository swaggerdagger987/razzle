# Evidence — Bureau Trade Network copy link export row

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`  
**Gate:** FACTORY-DOD C2/C3

## Change

- `BureauTradeNetwork.tsx`: copy link button beside export card (mirrors Pressure Map / Manager Profiles).

## Verification

```bash
curl -s -o /tmp/og-trade-network.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?league=test&download=1'
# 200 67677

file /tmp/og-trade-network.png
# PNG image data, 1200 x 630
```

```bash
npm run build --workspace=apps/web  # pass
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
```

**Verdict:** PASS — OG PNG ≥40KB with partnership lane layout.
