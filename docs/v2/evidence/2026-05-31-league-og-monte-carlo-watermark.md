# Evidence — League L5 Monte Carlo OG terracotta watermark

**Date:** 2026-05-31  
**Atom:** `league-og-monte-carlo-watermark` (epic atom 1/4)

| Check | Result |
|-------|--------|
| pytest | `test_monte_carlo_og_watermark.py` — 1 passed |
| web build | `npm run build --workspace=apps/web` — exit 0 |
| curl | `GET /og/monte-carlo?download=1&league=demo&user=demo` → **200 58867** PNG 1200×630 |
| Hallway | `toLeague(league, "monte-carlo")` in terracotta watermark band |
| Stickers | LIVE · Sleeper sim odds / SAMPLE · demo title odds / EXPORTED · panel sim rows |

**Verdict:** PASS — Gate C satisfied with demo fallback.
