# Evidence — Lab percentiles OG toLab WR position

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-tolab` (WR position hallway)  
**Epic:** Lab L5 — pro profile OG live parity (4/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 11 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/percentiles-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/percentiles?force_demo=1&download=1'
# 200 65326 — PNG 1200×630
```

## Change

Percentiles OG watermark now includes `position=WR` in toLab link (matches Ja'Marr Chase default player + demo peer bars). Additive to prior default-player hallway merge.

## Verdict

**PASS** — Gate C PNG ≥40KB; TOLAB_DEFAULT_POSITION percentiles WR.
