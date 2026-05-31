# Evidence — Bureau H2H OG snapshot decode (2026-05-31)

**Slice:** `bureau-h2h-og-snapshot-decode` — wire shared decode on OG route  
**Cycle:** 89

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 52 passed (2 pre-existing snapshot errors on base) |
| Baseline OG (demo) | `200 59305` bytes PNG |
| Snapshot OG (exported matchup) | `200 51310` bytes PNG |

## Fix

Base OG used inline `decodeH2hSnapshot` expecting `t` for opponent; `encodeBureauH2HOgSnapshot` uses `m`. Route now calls `decodeBureauH2HOgSnapshot` from `@/lib/bureau-h2h-og-snapshot`.

## Verdict

**PASS** — FACTORY-DOD Gate C; subtitle `exported matchup` on snapshot OG.
