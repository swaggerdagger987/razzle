# Evidence — Lab OG breakouts + weekly position filter polish

**Date:** 2026-05-31  
**Atom:** `lab-og-filter-breakouts-weekly`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web — exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q — 51 passed, 5 skipped
curl /og/breakouts?download=1&position=WR — 200 PNG ≥40KB
curl /og/weekly?download=1&position=WR — 200 PNG ≥40KB
```

## Notes

Breakouts/weekly `LabOgExportLink.position` landed on base via PR #153; this cycle adds `pos` URL alias and demo-row fallback on filtered OG cards.
