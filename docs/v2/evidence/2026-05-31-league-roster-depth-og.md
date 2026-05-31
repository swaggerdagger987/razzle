# Evidence — League L5 roster depth OG export

**Date:** 2026-05-31  
**Atom:** `league-roster-depth-og-route`  
**Trust:** T2, T5, T6

## Gate C — PNG curl

```bash
curl -s -o /tmp/og-roster-depth.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/roster-depth?download=1'
# 200 61102
file /tmp/og-roster-depth.png
# PNG image data, 1200 x 630
```

## Files

- `apps/web/app/og/roster-depth/route.tsx` — demo + snapshot + live API
- `apps/web/lib/bureau-roster-depth-og-snapshot.ts` — encode/decode + panel builder
- `apps/web/components/league/BureauRosterDepth.tsx` — copy link + export with snapshot param

## Verdict

PASS — roster depth export card shows per-position grades and top names; ≥40KB PNG.
