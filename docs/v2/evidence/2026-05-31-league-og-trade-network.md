# Evidence — League L5 Trade Network OG

**Date:** 2026-05-31  
**Slice:** `league-og-trade-network`  
**Route:** `/og/trade-network?download=1`

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-trade-network.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?download=1'
file /tmp/og-trade-network.png
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 67677 bytes |
| Format | PNG 1200×630 |
| Demo rows | 4 partnership lanes + hero callout |
| Sample label | "sample preview" when API empty |

## Verdict

PASS — FACTORY-DOD Gate C2/C3 satisfied.
