# Evidence — Lab OG breakouts score-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Change

`BreakoutsRenderer` sorts candidates by `rbs_score` (or active formula score) before encoding top-6 OG snapshot rows — matching panel leader order.

## Commands (executed)

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/breakouts?download=1'
file /tmp/og-breakouts.png
```

## Results

| Route | HTTP | PNG bytes | Notes |
|-------|------|-----------|-------|
| `/og/breakouts?download=1` | 200 | 60649 | PNG 1200×630, demo/live rows |

Gate C2 satisfied (≥40KB, real row layout).
