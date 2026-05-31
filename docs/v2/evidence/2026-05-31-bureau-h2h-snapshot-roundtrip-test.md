# Evidence — Bureau H2H snapshot roundtrip test (2026-05-31)

**Atom:** `bureau-h2h-snapshot-roundtrip-test`  
**Epic:** League L5 — Bureau H2H snapshot codec matches OG decode (atom 3/3 complete)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest \
  apps/api/tests/test_bureau_h2h_og_codec.py apps/api/tests/test_bureau_head_to_head.py -q
# 6 passed

curl -s -o /tmp/h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
# 200 71895

SNAP=eyJ5Ijp7InQiOiJZb3VyIFNxdWFkIiwiciI6IjgtNSIsInAiOjExOC40fSwibSI6eyJ0IjoiUml2YWwgRkMiLCJyIjoiNy02IiwicCI6MTEyLjF9LCJwYyI6W3sicCI6IlJCIiwieSI6NCwibSI6Mn0seyJwIjoiV1IiLCJ5Ijo1LCJtIjo2fSx7InAiOiJURSIsInkiOjIsIm0iOjF9XSwidGYiOnsibyI6WyJSQiJdLCJnIjpbIldSIl19fQ
curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/head-to-head?download=1&snapshot=${SNAP}"
# 200 72304
```

## Verdict

**PASS** — pytest encode/decode roundtrip matches ShareBar compact codec; OG snapshot PNG ≥40KB.
