# Evidence — lab-og-breakouts-rankings-formula-live

**Date:** 2026-05-31  
**Cycle:** 141  
**Atom:** `lab-og-breakouts-rankings-formula-live`  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests/test_og_launch10_formula_live.py apps/api/tests/test_og_launch10_live_sticker.py -q` — 4 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
# 200 66253

curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1'
# 200 66806
```

## Verdict

PASS
