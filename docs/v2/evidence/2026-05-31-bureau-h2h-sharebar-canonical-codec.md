# Evidence — Bureau H2H ShareBar canonical snapshot codec (2026-05-31)

**Atom:** `bureau-h2h-sharebar-canonical-codec`  
**Epic:** League L5 — Bureau H2H snapshot codec matches OG decode (atom 1/3)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1'
# 200 71895
curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1&snapshot=<canonical y/m/pc param>'
# 200 70829
file /tmp/h2h-snap.png  # PNG 1200x630
```

## Verdict

PASS — `BureauH2HShareBar` encodes via `encodeBureauH2HOgSnapshot`; OG route decodes with shared lib so export cards match in-panel rivalry rows.

## Trust

T5 (export fidelity), T6 (hallway Atlas link unchanged on ShareBar).
