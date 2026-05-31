# Evidence — 2026-05-31 lab-og-export-prospects-weekly-tradevalues

**Slice:** LabOgExportLink on prospects, weekly, tradevalues  
**Verdict:** PASS

```text
npm run build --workspace=apps/web → exit 0
curl /og/prospects?download=1 → 200 58084
curl /og/weekly?download=1 → 200 63819
curl /og/tradevalues?download=1 → 200 62488
```

Trust: T5, T6
