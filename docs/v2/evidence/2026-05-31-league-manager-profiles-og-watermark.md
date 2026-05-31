# Evidence — Manager Profiles OG watermark band (2026-05-31)

**Atom:** `league-manager-profiles-og-watermark`  
**Epic:** League L5 — Bureau behavioral OG parity (atom 1/2)

## Gate C

```bash
curl -s -o /tmp/mp-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/manager-profiles?league=demo&download=1'
# 200 73152

file /tmp/mp-og.png
# PNG image data, 1200 x 630
```

## Pytest

```bash
python3 -m pytest apps/api/tests/test_manager_profiles_og_watermark.py -q --noconftest
# 2 passed
```

## Build

```bash
npm run build --workspace=apps/web
# exit 0
```
