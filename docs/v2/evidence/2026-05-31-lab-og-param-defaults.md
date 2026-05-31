# Evidence — Lab L5 OG launch-10 labels + default player_id

**Date:** 2026-05-31  
**Atom:** `lab-og-param-defaults` (+ launch-10 demo labels on base)  
**Commit:** ddc28666

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/dynasty-comps?download=1` | 200 | 65961 | PASS |
| `/og/gamelog?download=1` | 200 | 58408 | PASS |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
