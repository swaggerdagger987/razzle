# Evidence — lab-og-trade-values-ranked

**Date:** 2026-05-31  
**Atom:** Trade Values OG export ranks top-6 by trade value  
**Verdict:** PASS (Gate C2)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&position=WR&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6OTUsInNsIjoiVmFsdWUifSx7Im4iOiJDaHJpc3RpYW4gTWNDYWZmcmV5IiwicCI6IldSIiwidCI6IlNGIiwicyI6ODgsInNsIjoiVmFsdWUifSx7Im4iOiJBbW9uLVJhIFN0LiBCcm93biIsInAiOiJXUiIsInQiOiJERVQiLCJzIjo4NCwic2wiOiJWYWx1ZSJ9LHsibiI6IkRhdmFudGUgQWRhbXMiLCJwIjoiV1IiLCJ0IjoiTEFSIiwicyI6ODIsInNsIjoiVmFsdWUifSx7Im4iOiJNYXJ2aW4gSGFycmlzb24gSnIuIiwicCI6IldSIiwidCI6IkFSSSIsInMiOjc4LCJzbCI6IlZhbHVlIn0seyJuIjoiR2VvcmdlIFBpY2tlbnMiLCJwIjoiV1IiLCJ0IjoiUElUIiwicyI6NzUsInNsIjoiVmFsdWUifV0='
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 62178 bytes (≥40KB) |
| file(1) | PNG 1200×630 |

## Change

`TradeValuesRenderer` sorts `ogSnapshotRows` by `trade_value` (or `formula_score`) desc before encoding — Bones panel OG matches chart leaders.
