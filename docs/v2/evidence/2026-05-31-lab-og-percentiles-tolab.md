# Evidence — lab-og-percentiles-tolab (2026-05-31)

**Atom:** `lab-og-percentiles-tolab`  
**Route:** `/og/percentiles?player_id=00-0036900&name=Ja%27Marr%20Chase&download=1`  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/percentiles-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/percentiles?player_id=00-0036900&name=Ja%27Marr%20Chase&download=1"
```

## Results

- pytest: 8 passed (`test_lab_og_tolab_watermark.py`)
- web build: exit 0
- curl percentiles OG: **200** PNG **65326** bytes
