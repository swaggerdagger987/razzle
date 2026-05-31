# Evidence — Lab L5 tradevalues OG snapshot export (2026-05-31)

**Atom:** `lab-og-launch10-live-label` (tradevalues slice)  
**Route:** `TradeValuesRenderer` → `/og/tradevalues`

## Change

`LabOgExportLink.snapshotRows` passes in-panel top-6 trade values so OG card shows `· from your panel` instead of demo `sample preview` when API empty on edge.

## Gate C — curl

```bash
curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTAyMDAsInNsIjoiVmFsdWUifV0'
# 200 41253 PNG
```

## Verdict

**PASS** — FACTORY-DOD Gate C2/C3 for tradevalues snapshot export.
