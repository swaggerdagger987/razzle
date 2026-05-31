# Evidence — lab-og-breakouts-score-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Epic:** Lab L5 — OG snapshot row fidelity (atom 3/3)

## Change

`/og/breakouts` fetches limit 25 before position filter + `rankPanelOgRows` by `rbs_score` (breakout score). BreakoutsRenderer snapshot rows sort top-6 by RBS/formula score for export parity.

## Gate C

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-breakouts-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?position=WR&download=1'
# 200 61718
file /tmp/og-breakouts-wr.png
# PNG 1200x630
```

## Verdict

**PASS** — PNG ≥40KB, route 200, RBS-ranked leaders for WR tab.
