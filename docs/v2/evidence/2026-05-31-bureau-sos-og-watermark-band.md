# Evidence — Bureau Strength of Schedule OG watermark band (2026-05-31)

**Atom:** `bureau-sos-og-watermark-band`  
**Epic:** League L5 — Bureau advanced tabs OG watermark parity (atom 2/3)  
**Verdict:** PASS

## Tests

```bash
JWT_SECRET=test PATH=$HOME/.local/bin:$PATH python3 -m pytest \
  apps/api/tests/test_bureau_sos_og_watermark.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-sos.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/strength-of-schedule?league=demo&download=1'
# 200 60588
file /tmp/og-sos.png
# PNG image data, 1200 x 630
```

**Verdict:** PASS — terracotta watermark band matches waiver/H2H exports; demo slate verdict + bars visible.
