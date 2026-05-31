# Evidence — Lab L5 Prospects OG snapshot (cycle 89)

**Date:** 2026-05-31  
**Slice:** `lab-og-snapshot-prospects`  
**Route:** `/og/prospects?snap=...&download=1`

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 43961 B (snapshot); 58084 B (demo fallback) |
| Rows | RPS-labeled prospect board from `encodeOgSnapshot` |

## Notes

- Trade values snapshot deduped on base (`69e4c732`) — not rebuilt this cycle.
- Prospects export passes `position` filter when tab selected.
