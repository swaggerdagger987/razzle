# Evidence — league-strength-of-schedule-og-share

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-og-share`  
**Epic:** League L5 — Bureau depth tab OG export cards (4/4)

## Route

`/og/strength-of-schedule?download=1` (demo fallback without league/user)

Panel export with query params: `rank`, `ppg`, `opp`, `verdict` + `league` + `user`

## curl (Gate C)

```bash
curl -s -o /tmp/og-sos.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/strength-of-schedule?download=1'
# 200 68101
file /tmp/og-sos.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — PNG ≥40KB; shows rank/PPG/opp stat cards, pace edge, Octo verdict (not loading-only).

## Tests

- `python3 -m pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → exit 0
