# Evidence — Bureau H2H snapshot round-trip test

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-snapshot-roundtrip-test`  
**Slice:** API test proves ShareBar snapshot codec round-trips

## Changes

- `apps/api/tests/test_bureau_h2h_og_snapshot_codec.py` — encode/decode compact y/m/pc/tf keys

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q   # 2 passed
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/head-to-head?download=1&snapshot=<encoded>'
# 200 70829
```

## Verdict

**PASS** — Codec round-trip locked; snapshot OG PNG ≥40KB.
