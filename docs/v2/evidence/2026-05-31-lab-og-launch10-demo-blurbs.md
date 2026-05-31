# Evidence — Lab L5 Launch-10 OG demo blurbs (2026-05-31)

**Slice:** `lab-og-launch10-demo-blurbs`  
**Route:** `/og/gamelog?force_demo=1&download=1`

## Tests

```
python3 -m pytest apps/api/tests/test_og_launch10_demo_sticker.py apps/api/tests/test_og_launch10_live_sticker.py -q
# 4 passed
```

## Gate C

```
curl -s -o /tmp/og-gamelog-demo.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/gamelog?force_demo=1&download=1"
# 200 58533
```

**Verdict:** PASS
