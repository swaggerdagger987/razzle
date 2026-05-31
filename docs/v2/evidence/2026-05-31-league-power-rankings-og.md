# Evidence — League L5 power-rankings OG

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`  
**Route:** `/og/power-rankings`

## Gate C

```bash
curl -s -o /tmp/og-power-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1'
# 200 63621
file /tmp/og-power-rankings.png
# PNG image data, 1200 x 630
```

Demo fallback: `sample preview` label when league param empty / API empty.

## Build / tests

- `npm run build --workspace=apps/web` — PASS (route listed)
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

**Verdict:** PASS — FACTORY-DOD Gate C satisfied.
