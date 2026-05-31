# Evidence — Bureau Power Rankings OG + share row

**Date:** 2026-05-31  
**Atom:** `bureau-power-rankings-og`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Route

- `GET /og/power-rankings?league=<id>&download=1`
- File: `apps/web/app/og/power-rankings/route.tsx`

## curl (local dev, demo league)

```text
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/power-rankings?league=demo&download=1'
→ 200 63022
file /tmp/og-pr.png → PNG 1200×630
```

Demo rows render when API empty; live fetch via `POST /api/bureau/power-rankings`.

## In-product

- `BureauPowerRankings.tsx` — `copy board link` + `export card` in header (mirrors Pressure Map / Monte Carlo).

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
