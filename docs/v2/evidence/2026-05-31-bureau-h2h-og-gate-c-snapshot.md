# Evidence — bureau-h2h-og-gate-c-snapshot

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-og-gate-c-snapshot` (League L5 H2H GTM epic 3/3)  
**Trust:** T5, T6

## Acceptance

```bash
JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_bureau_h2h_og_gate_c_snapshot.py \
  apps/api/tests/test_bureau_h2h_og_snapshot_codec.py \
  apps/api/tests/test_bureau_h2h_og_exported_sticker.py -q --noconftest
# 9 passed

npm run build --workspace=apps/web
# exit 0

# Gate C — snapshot OG PNG (DEMO_SNAPSHOT_PARAM from codec test)
curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&snapshot=<DEMO_SNAPSHOT_PARAM>'
# 200 76270 — PNG 1200×630
```

## Verdict

PASS — FACTORY-DOD Gate C2/C3; H2H GTM export epic complete.
