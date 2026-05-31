# Evidence — League L5 Trade Finder OG export card

**Date:** 2026-05-31  
**Slice:** Bureau Trade Finder share card at `/og/trade-finder`

| Check | Result |
|-------|--------|
| Route 200 | `curl http://127.0.0.1:3000/og/trade-finder?download=1` → 200 |
| PNG size | 57238 bytes (≥ 40KB) |
| Demo fallback | Hero match + 2 more trades with value gaps when no league params |
| In-product | `export card` on Bureau Trade Finder hero when Sleeper user linked |

**Verdict:** PASS with demo fallback; live matches require `?league=&user=` + API.
