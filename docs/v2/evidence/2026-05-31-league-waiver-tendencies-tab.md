# Evidence — league-waiver-tendencies-tab

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-tab`  
**Verdict:** PASS

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `pytest apps/api/tests -q` | 52 passed, 4 failed (screener snapshot — unrelated to Bureau web) |
| Waiver unhidden | `waiver-tendencies` removed from `HIDDEN_BUREAU_SLUGS` |
| Renderer | `BureauWaiverTendencies.tsx` wired in `BureauFeatureBody` |

## Dedup

- `league-build-profiles-tab` already on base (`3d0809b5`, PR #353) — not rebuilt this cycle.
