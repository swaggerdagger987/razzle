# Evidence — League L5 Monte Carlo OG export card

**Date:** 2026-05-31  
**Slice:** Bureau Monte Carlo share card at `/og/monte-carlo`

| Check | Result |
|-------|--------|
| Route 200 | `curl http://127.0.0.1:3000/og/monte-carlo?download=1` → 200 |
| PNG size | 53350 bytes (≥ 40KB) |
| Demo fallback | Top-3 managers with title/playoff % bars when no league params |
| In-product | `export card` on Bureau Monte Carlo when Sleeper user linked |

**Verdict:** PASS with demo fallback; live odds require `?league=&user=` + API.
