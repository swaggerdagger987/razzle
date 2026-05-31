# Evidence — Bureau H2H OG route lib decode

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-og-route-lib-decode`

## Dedup

- `apps/web/app/og/head-to-head/route.tsx` imports `decodeBureauH2HOgSnapshot` from `@/lib/bureau-h2h-og-snapshot` only (no inline codec).

## Curl

- Demo: `curl .../og/head-to-head?download=1` → `200 71895`
- Snapshot (compact y/m/pc): → `200 67620`

**Verdict:** PASS
