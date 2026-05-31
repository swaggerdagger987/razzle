# Evidence — Lab L5 Breakouts OG score-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`

## Change

- `BreakoutsRenderer` sorts by formula/RBS score before top-6 snapshot encode.

## Verification

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/breakouts?download=1'
# → 200 60649
```

## Verdict

**PASS**
