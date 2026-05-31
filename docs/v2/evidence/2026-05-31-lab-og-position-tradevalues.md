# Evidence — lab-og-position-tradevalues-prospects

**Date:** 2026-05-31  
**Atom:** Trade values export passes position filter to OG  
**Verdict:** PASS (Gate C2)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
python3 -m pytest apps/api/tests -q   # 51 passed
curl -s -o /tmp/og-tradevalues-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&position=WR&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6OTUsInNsIjoiVmFsdWUifV0='
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 41723 bytes (≥40KB) |
| file(1) | PNG 1200×630 |
| position param | WR echoed on OG URL from LabOgExportLink |

## Change

`TradeValuesRenderer` passes `position={position || undefined}` to `LabOgExportLink` so Bones trade-value exports match the in-panel position tab. Prospects already wired (dedup).
