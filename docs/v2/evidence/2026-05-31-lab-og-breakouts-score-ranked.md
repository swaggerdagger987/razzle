# Evidence — Lab L5 breakouts OG score-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Slice:** Breakouts OG export ranks top-6 by RBS/breakout score

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/breakouts?download=1&position=WR` | 200 | 61718 | PNG 1200×630; WR demo/live rows sorted by Score desc |

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&position=WR'
file /tmp/og-breakouts.png
```

## Build

- `npm run build --workspace=apps/web` — exit 0

## Code

- `BreakoutsRenderer` — `ogSnapshotRows` sorts candidates by `rbs_score` (or formula score) before top-6 snapshot encode.
- `apps/web/app/og/[panel]/route.tsx` — live `/og/breakouts` rows sorted by stat before render when no snapshot param.

**Verdict:** PASS — export card shows highest breakout scores first (Lab L5 fidelity epic atom 3/3).
