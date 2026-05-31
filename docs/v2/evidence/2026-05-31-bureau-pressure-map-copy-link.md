# Evidence — Bureau Pressure Map copy link export row

**Date:** 2026-05-31  
**Atom:** `bureau-pressure-map-copy-link`  
**Gate:** FACTORY-DOD C2/C3

## Change

- `BureauPressureMap.tsx`: copy link button beside export card (mirrors Manager Profiles).

## Verification

```bash
curl -s -o /tmp/og-pressure-map.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/pressure-map?league=test&download=1'
# 200 60661

file /tmp/og-pressure-map.png
# PNG image data, 1200 x 630
```

```bash
npm run build --workspace=apps/web  # pass
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
```

**Verdict:** PASS — OG PNG ≥40KB with pressure bar layout.
