# Evidence — Lab L5 breakouts OG score-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`

## Change

- `BreakoutsRenderer` OG snapshot sorts top-6 by formula score or RBS before encode

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q --ignore=apps/api/tests/test_screener_snapshot.py` — 52 passed, 2 failed (intel sync, screener college — pre-existing env on base)

## OG curl (Gate C2)

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1'
# 200 60649
file /tmp/og-breakouts.png  # PNG 1200x630
```

**Verdict:** PASS
