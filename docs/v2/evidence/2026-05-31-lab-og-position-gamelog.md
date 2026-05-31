# Evidence — Lab L5 Gamelog OG position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-gamelog`  
**Content hash:** 7e109165

## Change

`GamelogRenderer.tsx` passes `position={displayPos || undefined}` to `LabOgExportLink` so OG URLs match in-panel position tabs (same pattern as efficiency/buysell).

## Commands (executed)

```bash
python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
npm run build --workspace=apps/web   # success
curl -s -o /tmp/gamelog-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&position=WR'
file /tmp/gamelog-wr.png
```

## Results

| Check | Output |
|-------|--------|
| pytest | 51 passed |
| web build | OK |
| curl gamelog WR | `200 48035` |
| file | PNG 1200×630 |

## Reality

PASS — Gate C satisfied (≥40KB PNG, position query param on export link).
