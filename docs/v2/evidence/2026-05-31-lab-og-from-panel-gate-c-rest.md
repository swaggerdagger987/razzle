# Evidence — Lab L5 prospects/tradevalues FROM PANEL Gate C (2026-05-31)

**Atom:** `lab-og-from-panel-gate-c-rest`  
**Epic:** Lab L5 — formula-sorted OG live parity (atom 3/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
# 200 63453

curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1'
# 200 67267
```

## Gate C

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/prospects?download=1` | 200 | 63453 | PASS ≥40KB PNG |
| `/og/tradevalues?download=1` | 200 | 67267 | PASS ≥40KB PNG |

**Reality:** PASS
