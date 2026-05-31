# Evidence — League L5 Pressure Map OG export card

**Date:** 2026-05-31  
**Slice:** Bureau Pressure Map share card at `/og/pressure-map`

| Check | Result |
|-------|--------|
| Route 200 | `curl localhost:3000/og/pressure-map?download=1` → 200 |
| PNG size | 60104 bytes (≥40KB) |
| Layout | Five desperation bars with score + label pills; hero callout |
| Demo fallback | Sample preview when no `league` param / API empty |
| In-product | `BureauPressureMap` export card link with `league` query |

**Verdict:** PASS — Gate C satisfied with demo fallback.
