# Evidence — lab-og-position-buysell

**Date:** 2026-05-31  
**Atom:** Buy/sell export passes position filter to OG  
**Verdict:** PASS (Gate C2)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
python3 -m pytest apps/api/tests -q   # 51 passed
curl -s -o /tmp/og-buysell-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&position=WR'
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 44258 bytes (≥40KB) |
| file(1) | PNG 1200×630 |
| position param | WR on OG URL from LabOgExportLink |

## Change

`BuySellRenderer` passes `position={position || undefined}` to `LabOgExportLink` so Bones buy/sell exports match the in-panel position tab. Completes Lab L5 position-filter epic (atom 3/3).
