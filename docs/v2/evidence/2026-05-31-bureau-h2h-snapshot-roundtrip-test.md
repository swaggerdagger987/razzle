# Evidence — Bureau H2H snapshot roundtrip test (2026-05-31)

**Atom:** `bureau-h2h-snapshot-roundtrip-test`  
**Epic:** League L5 — Bureau H2H snapshot codec matches OG decode (atom 3/3)

## Commands

```bash
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q
# 3 passed

JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 54 passed, 5 skipped

npm run build --workspace=apps/web  # exit 0

curl -s -o /tmp/h2h-roundtrip.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1&snapshot=<canonical y/m/pc token>'
# 200 70045
file /tmp/h2h-roundtrip.png  # PNG 1200x630
```

## Verdict

PASS — pytest proves canonical + legacy ShareBar snapshot payloads round-trip decode; OG route renders exported rivalry PNG ≥40KB from snapshot param.

## Trust

T5 (export fidelity), T6 (codec contract locked in CI).
