# Evidence — League L5 Monte Carlo OG snapshot

**Date:** 2026-05-31  
**Atom:** `league-monte-carlo-og-snapshot`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web → exit 0
curl /og/monte-carlo?league=test&user=test&download=1&snapshot=… → 200 53716 PNG 1200×630
```

## Change

`encodeBureauMonteCarloOgSnapshot` + ShareBar passes top-3 title odds; OG route prefers snapshot with "from your board" label.
