# Evidence — Lab OG snapshot prospects + tradevalues

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-prospects-tradevalues`  
**Slice:** Prospects + tradevalues pass snapshotRows to OG export

## Gate C — OG PNG

```text
prospects snapshot  200 58084  (/og/prospects?download=1&snapshot=…)
tradevalues snapshot 200 41253  (/og/tradevalues?download=1&snapshot=…)
file                 PNG 1200x630 both
pytest               52 passed (2 env snapshot errors)
web build            exit 0
```

## Verdict

PASS — Gate C satisfied; export cards mirror in-panel top rows.
