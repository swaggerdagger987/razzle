# Evidence — Lab OG watermark player display name (2026-05-31)

**Atom:** `lab-og-watermark-display-name`  
**Cycle:** 156

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q
# 6 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog-named.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&name=Ja%27Marr%20Chase"
# 200 62741
```

**PASS** — Gate C satisfied. Gamelog export passes `name=`; watermark `toLab` uses resolved display name (T6).
