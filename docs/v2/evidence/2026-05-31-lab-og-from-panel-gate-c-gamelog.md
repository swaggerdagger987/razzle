# Evidence — lab-og-from-panel-gate-c-gamelog

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-gate-c-gamelog` — Gate C curl on gamelog + efficiency FROM PANEL snapshots  
**Trust:** T5, T6

## Build

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_gate_c_gamelog.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — snapshot PNG (FROM PANEL path)

```bash
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=<GAMELOG_SNAPSHOT>'
# 200 61863

curl -s -o /tmp/og-efficiency-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?download=1&snapshot=<EFFICIENCY_SNAPSHOT>'
# 200 63986

file /tmp/og-gamelog-snap.png    # PNG 1200x630
file /tmp/og-efficiency-snap.png # PNG 1200x630
```

Fixture params documented in `apps/api/tests/test_og_from_panel_gate_c_gamelog.py`.

## Verdict

PASS — both snapshot exports ≥40KB with six in-panel rows; closes FROM PANEL Gate C epic 3/3.
