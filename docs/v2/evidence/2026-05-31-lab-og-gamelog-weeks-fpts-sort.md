# Evidence — lab-og-gamelog-weeks-fpts-sort

**Date:** 2026-05-31  
**Atom:** Gamelog OG ranks peak weeks by FPTS on live fetch  
**Route:** `/og/gamelog`

## Gate C

| Request | HTTP | Bytes | Verdict |
|---------|------|-------|---------|
| `?download=1` (demo rows) | 200 | 61145 | PASS ≥40KB |

## Build

- `npm run build --workspace=apps/web` — exit 0
- `python3 -m pytest apps/api/tests -q` — 56 passed, 2 failed (screener env; unchanged API surface)

## Change

`extractGamelogRows` sorts `weeks[]` by `fpts` desc for OG export — mirrors `GamelogRenderer` ogSnapshotRows.
