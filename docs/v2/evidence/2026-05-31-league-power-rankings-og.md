# Evidence — League L5 Power Rankings OG

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`  
**Route:** `/og/power-rankings`

## Gate C2 — PNG curl

```bash
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test'
file /tmp/og-pr.png
```

| Result | Value |
|--------|-------|
| HTTP | 200 |
| Size | 54876 bytes |
| Format | PNG 1200×630 |

## Gate C3 — demo fallback

Without live bureau context, card shows three sample teams with differential bars and "sample preview" subtitle.

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — FACTORY-DOD Gate C satisfied.
