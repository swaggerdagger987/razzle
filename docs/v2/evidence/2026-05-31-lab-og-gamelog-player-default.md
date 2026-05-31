# Evidence — lab-og-gamelog-player-default (cycle 129)

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Gate C:** `/og/gamelog` export path

## Curl

```bash
curl -s -o /tmp/gamelog-og.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900"
# 200 60634 — PNG 1200×630
```

## Contract

- `LabOgExportLink` sets `player_id=00-0036900` when slug is `gamelog` or `dynasty-comps` and `playerId` is omitted.
- Complements cycle 128 empty-state gamelog export on base (`e37cd230`).

**Verdict:** PASS
