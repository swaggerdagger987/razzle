# Evidence — Bureau H2H snapshot roundtrip test (2026-05-31)

**Atom:** `bureau-h2h-snapshot-roundtrip-test`  
**Epic:** League L5 — Bureau H2H snapshot codec matches OG decode (atom 3/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q
# 4 passed
JWT_SECRET=test python3 -m pytest apps/api/tests -q
# 55 passed, 5 skipped
npm run build --workspace=apps/web
# exit 0
curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&snapshot=<DEMO_SNAPSHOT_PARAM>'
# 200 72304
file /tmp/h2h-snap.png  # PNG 1200x630
```

## Verdict

PASS — pytest mirrors ShareBar y/m/pc compact codec; OG accepts canonical snapshot param with exported matchup subtitle.

## Trust

T5 (export fidelity), T6 (CI guardrail without web test runner).
