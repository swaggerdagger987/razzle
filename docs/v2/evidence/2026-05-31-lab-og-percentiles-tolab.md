# Evidence — Lab percentiles OG toLab hallway

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-tolab`  
**Epic:** Lab L5 — pro profile OG live parity (4/4)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test-secret python3 -m pytest \
  apps/api/tests/test_lab_og_percentiles_tolab.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-percentiles.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/percentiles?download=1&player_id=00-0036900'
# 200 63863 — PNG 1200×630
```

## Change

Percentiles panel export passes default Ja'Marr Chase `playerId` + `playerName` so OG watermark toLab opens Player Sheet hallway (Pro gate + live panel footer).

## Verdict

**PASS** — Gate C percentiles PNG ≥40KB.
