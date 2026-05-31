# Evidence — Lab L5 OG position on efficiency + aging

**Date:** 2026-05-31  
**Atom:** `lab-og-position-efficiency-aging`  
**Verdict:** PASS

## Changes

- `EfficiencyRenderer` — `LabOgExportLink` passes `position={position || undefined}`
- `AgingCurvesRenderer` — `LabOgExportLink` passes `position={position}`

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## Gate C (curl)

```bash
curl -s -o /tmp/og-eff-rb.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?download=1&position=RB'
# 200 45113

curl -s -o /tmp/og-aging-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/aging?download=1&position=WR'
# 200 44093
```

PNG verified ≥ 40KB.
