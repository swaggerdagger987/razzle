# Evidence — lab-og-percentiles-tolab (2026-05-31)

**Atom:** `lab-og-percentiles-tolab`  
**Epic:** Lab L5 — pro profile OG live parity (atom 4/4)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q
# 9 passed

npm run build --workspace=apps/web
# exit 0
```

## Claim

Percentiles OG watermark uses `TOLAB_DEFAULT_POSITION.percentiles = WR` so screenshot
viewers land on `/lab/percentiles?position=WR` with default Ja'Marr player context.
