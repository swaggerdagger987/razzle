# Evidence — Lab OG position filter tradevalues (2026-05-31)

**Atom:** `lab-og-position-tradevalues` — TradeValuesRenderer passes `position` to `LabOgExportLink`.

## Curl (Gate C)

```bash
curl 'http://localhost:3000/og/tradevalues?position=WR&download=1' → 200 51115 bytes PNG
curl 'http://localhost:3000/og/tradevalues?position=RB&download=1' → 200 42142 bytes PNG
```

**Verdict:** PASS
