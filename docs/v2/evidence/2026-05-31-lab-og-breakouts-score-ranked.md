# Evidence — Lab L5 breakouts OG score-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Slice:** BreakoutsRenderer ranks top-6 by RBS/formula score for OG export

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/breakouts?download=1&snapshot=…` | 200 | 60649 | PNG 1200×630, Braiden Purdy RBS row |

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&snapshot=eyJuIjoiQnJhaWRlbiBQdXJkeSIsInAiOiJSQiIsInQiOiJERUYiLCJzIjo4Nywic2wiOiJSQlMifV0'
```

## Build

- `npm run build --workspace=apps/web` — exit 0

**Verdict:** PASS — export card rows sorted by breakout score, not API arrival order.
