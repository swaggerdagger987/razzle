# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Trust:** T5, T6

## Contract

- `buildLabOgExportParams` always sets `player_id` for player-scoped Lab slugs (including gamelog).
- Gamelog empty state offers "export sample card" without requiring `?id=` in the Lab URL.

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 60634 | PASS |

```bash
curl -s -o /tmp/gamelog-og-default.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900'
file /tmp/gamelog-og-default.png  # PNG 1200x630
```

## Tests / build

- `python3 -m pytest apps/api/tests/test_lab_og_gamelog_export.py -q` — 3 passed
- `npm run build --workspace=apps/web` — exit 0
