# Evidence — bureau-h2h-snapshot-league-hallway

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-snapshot-league-hallway` — H2H snapshot embeds league/user for watermark deep link.

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_bureau_h2h_og_snapshot_league.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-h2h-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&snapshot=<lg/u/o embedded>'
# 200 70626
```

## Change

- `encodeBureauH2HOgSnapshot` stores `lg`, `u`, `o` in compact payload.
- `/og/head-to-head` restores league params from snapshot when query params omitted.
- Watermark `leagueDeepLink` survives snapshot-only shares.

## Verdict

PASS — FACTORY-DOD Gate C2.
