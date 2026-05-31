# Evidence — Bureau Waiver Tendencies OG watermark band (2026-05-31)

**Atom:** `bureau-waiver-og-watermark-band`  
**Epic:** League L5 — Bureau advanced tabs OG watermark parity (atom 1/3)  
**Verdict:** PASS

## Tests

```bash
JWT_SECRET=test PATH=/home/ubuntu/.local/bin:$PATH python3 -m pytest \
  apps/api/tests/test_bureau_waiver_og_watermark.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-waiver.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/waiver-tendencies?league=demo&download=1'
# 200 70937
file /tmp/og-waiver.png
# PNG image data, 1200 x 630
```

**Verdict:** PASS — terracotta watermark band matches H2H/Lab exports; demo manager rows visible.
