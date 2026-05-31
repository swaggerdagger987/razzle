# Evidence — Lab weekly OG PPG-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`

## Gate C

```text
curl /og/weekly?download=1&position=WR → 200, PNG ≥40KB (demo/fallback rows PPG-sorted)
npm run build --workspace=apps/web → PASS
pytest apps/api/tests → 51 passed
```

## Verdict

PASS — OG route sorts weekly live/demo rows by PPG; panel export always offers snapshot.
