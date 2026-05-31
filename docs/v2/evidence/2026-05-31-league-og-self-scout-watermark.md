# Evidence — league-og-self-scout-watermark

**Date:** 2026-05-31  
**Atom:** Self-Scout OG terracotta watermark band (League L5 epic 2/4)  
**Route:** `/og/self-scout?download=1`

## Gate C

| Check | Result |
|-------|--------|
| pytest `test_self_scout_og_watermark.py` | PASS (1) |
| `npm run build --workspace=apps/web` | exit 0 |
| curl `?download=1` | `200 68720` — PNG 1200×630 |

## Notes

- Terracotta hallway band via `toLeague(league, "self-scout")`.
- LIVE / SAMPLE / EXPORTED stickers mirror Monte Carlo OG pattern.
- `resolveApiOrigin` for same-origin API in edge OG.
