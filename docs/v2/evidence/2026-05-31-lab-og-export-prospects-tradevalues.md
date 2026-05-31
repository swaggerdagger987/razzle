# Evidence — Lab OG prospects + trade-values snapshot export

**Date:** 2026-05-31  
**Slice:** `lab-og-export-prospects-tradevalues`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1'
# 200 58084
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1'
# 200 62488
```

## Notes

- `ProspectsRenderer` and `TradeValuesRenderer` pass `snapshotRows` from visible panel rows via `LabOgExportLink`.
- Position tab changes refetch panel data; export URL encodes matching top-six rows.
