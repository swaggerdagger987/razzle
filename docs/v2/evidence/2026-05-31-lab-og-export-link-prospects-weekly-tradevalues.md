# Evidence — Lab OG export links prospects / weekly / tradevalues (dedup verify)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-link-prospects-weekly-tradevalues`  
**Verdict:** PASS (dedup — already on `origin/razzle-v2-redesign` at `2b5ef212`)

## On-base verification

```bash
git merge-base --is-ancestor 2b5ef212 origin/razzle-v2-redesign && echo ON_BASE
curl /og/prospects?download=1   → 200 58084
curl /og/weekly?download=1      → 200 63819
curl /og/tradevalues?download=1 → 200 62488
```
