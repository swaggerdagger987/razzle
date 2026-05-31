# Evidence — league-power-rankings-og (cycle 80)

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`  
**Content commit:** `28f39b4a`

## Gate C2 — OG PNG

```text
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test'
# 200 59807
file /tmp/og-pr.png
# PNG image data, 1200 x 630
```

Demo fallback when league API cold (`DEMO_ROWS` in route). Live fetch via `POST /api/bureau/power-rankings`.

## Build / API

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — FACTORY-DOD Gate C2 satisfied (59807B ≥ 40KB).
