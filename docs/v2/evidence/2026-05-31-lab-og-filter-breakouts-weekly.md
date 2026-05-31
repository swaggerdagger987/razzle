# Evidence — Lab OG breakouts + weekly position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-filter-breakouts-weekly`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web — exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q — 51 passed, 5 skipped
curl /og/breakouts?download=1&position=WR — 200 62488 bytes PNG 1200×630
curl /og/weekly?download=1&position=WR — 200 54101 bytes PNG 1200×630
curl /og/breakouts?download=1 (all) — 200 60649 bytes
```

## Gate C

- PNG ≥ 40KB with WR filter badge on card
- Demo rows filtered to WR when API empty (sample preview subtitle)
