# Lab efficiency OG position filter — 2026-05-31

**Atom:** `lab-efficiency-og-position-filter`  
**Slice:** Efficiency OG export passes position filter (epic atom 2/3)

## Change

`EfficiencyRenderer` passes `position` to `LabOgExportLink` so `/og/efficiency` applies the same filter as the in-product RB/WR/TE tabs (mirrors `ProspectsRenderer`).

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-eff-rb.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?position=RB&download=1'
# 200 45113

curl -s -o /tmp/og-eff-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?position=WR&download=1&snapshot=W3sibiI6IkFtb24tUmEgU3QuIEJyb3duIiwicCI6IldSIiwidCI6IkRFVCIsInMiOjAuMzcsInNsIjoiUFBPIn0seyJuIjoiVHlyZWVrIEhpbGwiLCJwIjoiV1IiLCJ0IjoiTUlBIiwicyI6MC4zOSwic2wiOiJQUE8ifV0'
# 200 44195

file /tmp/og-eff-rb.png /tmp/og-eff-snap.png
# PNG 1200x630 both
```

## Gate C

PASS — PNG ≥ 40KB with position=RB and snapshot+position=WR.
