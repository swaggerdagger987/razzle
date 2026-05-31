# Evidence — League L5 Power Rankings OG

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`  
**Route:** `/og/power-rankings?download=1&league=test`

## Gate C

```text
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test'
→ 200 59807
file /tmp/og-pr.png → PNG 1200×630
```

Demo rows render (#1 Dynasty Dukes, diff bars, luck index). Sample preview label when API empty.

## Build

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed

## Verdict

**Reality: PASS** — FACTORY-DOD Gate C2 satisfied.
