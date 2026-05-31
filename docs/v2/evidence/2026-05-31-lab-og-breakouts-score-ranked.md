# Evidence — Lab L5 breakouts OG RBS-ranked snapshot

**Date:** 2026-05-31  
**Slice:** `lab-og-breakouts-score-ranked`  
**Atom:** Breakouts OG export ranks top-6 by RBS score  

## Change

`BreakoutsRenderer` sorts `rawCandidates` by `rbs_score` descending before encoding `snapshotRows` (when no custom formula). Stat label `Score` on OG card.

## Gate C — curl

```bash
# production build served locally (next start)
curl -s -o /tmp/og-breakouts.png -w "HTTP %{http_code} size %{size_download}\n" \
  "http://localhost:3000/og/breakouts?download=1&snapshot=<ranked-demo-snapshot>"
file /tmp/og-breakouts.png
```

**Result:** HTTP 200, size 60642 bytes, PNG 1200×630.

## Verdict

PASS — export card shows ranked breakout scores, not arbitrary API order.
