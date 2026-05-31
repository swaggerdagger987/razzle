# Evidence — lab-og-extract-sort-leaders

**Date:** 2026-05-31  
**Atom:** `lab-og-extract-sort-leaders`  
**Verdict:** PASS

## Change

`extractRows` sorts mapped rows by stat (asc for rank, desc otherwise) before slicing top 6.

## Gate C

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/rankings?download=1` | 200 | 59509 |
| `/og/breakouts?download=1` | 200 | 60649 |

## Commands

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests -q` — 52 passed (snapshot env errors without terminal.db)
