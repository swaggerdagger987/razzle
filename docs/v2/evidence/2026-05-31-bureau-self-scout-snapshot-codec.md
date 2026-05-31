# Evidence — bureau-self-scout-snapshot-codec

**Date:** 2026-05-31  
**Atom:** `bureau-self-scout-snapshot-codec`  
**Trust:** T2, T5, T6

## Contract

- `encodeBureauSelfScoutOgSnapshot` / `decodeBureauSelfScoutOgSnapshot` compact codec (t/r/d keys).
- `BureauSelfScout` export link encodes in-panel depth grades via snapshot param.
- `/og/self-scout` decodes snapshot and renders depth grade rows (not demo fallback).

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/self-scout?download=1` | 200 | 66997 | PASS |
| `/og/self-scout?download=1&snapshot=<DEMO>` | 200 | 66419 | PASS ≥40KB |

```bash
curl -s -o /tmp/self-scout-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1'
curl -s -o /tmp/self-scout-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1&snapshot=<DEMO_SNAPSHOT_PARAM>'
file /tmp/self-scout-snap.png  # PNG 1200x630
```

## Tests / build

- `python3 -m pytest apps/api/tests/test_bureau_self_scout_og_snapshot_codec.py -q --noconftest` — 3 passed
- `npm run build --workspace=apps/web` — exit 0
