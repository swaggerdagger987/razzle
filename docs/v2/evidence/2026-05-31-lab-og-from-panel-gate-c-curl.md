# Evidence — lab-og-from-panel-gate-c-curl

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-gate-c-curl` — Gate C curl on breakouts + buysell FROM PANEL snapshots  
**Trust:** T5, T6

## Build

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_gate_c_curl.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — snapshot PNG (FROM PANEL path)

```bash
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&snapshot=<BREAKOUTS_SNAPSHOT>'
# 200 66331

curl -s -o /tmp/og-buysell-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&snapshot=<BUYSELL_SNAPSHOT>'
# 200 63427

file /tmp/og-breakouts-snap.png  # PNG 1200x630
file /tmp/og-buysell-snap.png    # PNG 1200x630
```

Fixture params documented in `apps/api/tests/test_og_from_panel_gate_c_curl.py`.

## Verdict

PASS — both snapshot exports ≥40KB with six in-panel rows encoded; pytest guards curl contract for Reality.
