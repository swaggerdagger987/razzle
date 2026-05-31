# Evidence — Bureau Waiver OG Gate C pytest (2026-05-31)

**Atom:** `bureau-waiver-og-gate-c-pytest`  
**Epic:** League L5 — Bureau advanced tabs OG watermark parity (atom 3/3 complete)  
**Verdict:** PASS

## Tests

```bash
PATH=$HOME/.local/bin:$PATH python3 -m pytest \
  apps/api/tests/test_bureau_waiver_og_watermark.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — OG PNG

Fixture params (documented in test): `download=1`

```bash
curl -s -o /tmp/waiver-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/waiver-tendencies?download=1'
# 200 68595
file /tmp/waiver-og.png
# PNG image data, 1200 x 630
```

**Verdict:** PASS — demo archetype rows + terracotta band; pytest guards route, demo fallback, share bar, Gate C params.
