# Evidence — lab-og-breakouts-score-ranked

**Date:** 2026-05-31  
**Atom:** Breakouts OG export ranks top-6 by breakout score (RBS / formula)  
**Verdict:** PASS

## Change

`BreakoutsRenderer` sorts `ogSnapshotRows` by `rbs_score` (or `formula_score` when a custom formula is active) before slicing top-6, matching Prospects/Weekly snapshot fidelity pattern.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/breakouts?download=1'
# 200 60649
file /tmp/og-breakouts.png   # PNG 1200x630
```

## Gate C2

PNG ≥ 40KB with demo rows on `/og/breakouts?download=1` — **PASS** (60649 bytes).
