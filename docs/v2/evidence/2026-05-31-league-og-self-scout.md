# Evidence — League L5 Self-Scout OG export

**Date:** 2026-05-31  
**Slice:** Self-Scout OG export card with depth grades snapshot  
**Atom:** `league-og-self-scout` (4/4 — epic complete)

## Route

- `GET /og/self-scout?download=1`
- Optional: `league`, `user` for live bureau payload; demo fallback when empty

## Gate C — curl

```bash
curl -s -o /tmp/og-self-scout.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/self-scout?download=1'
# 200 66997
file /tmp/og-self-scout.png
# PNG 1200x630
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

PASS — four position grade cards (A–F, /100 scores, top asset names), Hawkeye badge, sample preview label when demo.
