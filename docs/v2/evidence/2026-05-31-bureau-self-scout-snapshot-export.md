# Evidence — Bureau Self-Scout snapshot export (2026-05-31)

**Atom:** `bureau-self-scout-snapshot-export`  
**Epic:** League L5 — Self-Scout export travels with depth grades (atom 1/3)

## Commands

```bash
npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/self-scout-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1'
# 200 66997

curl -s -o /tmp/self-scout-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1&snapshot=<ENCODED_PANEL_SNAPSHOT>'
# 200 43007

file /tmp/self-scout-demo.png
# PNG 1200x630
```

## Verdict

PASS — export card passes compact snapshot; OG decodes panel depth grades without live API. Demo fallback unchanged when no snapshot.

## Trust

T5 (export fidelity), T6 (Hawkeye Self-Scout voice on card).
