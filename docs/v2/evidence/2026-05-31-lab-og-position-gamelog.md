# Evidence — Lab OG position filter gamelog

**Date:** 2026-05-31  
**Atom:** `lab-og-position-gamelog`  
**Cycle:** 103

## Acceptance

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/gamelog-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&position=WR'
# 200 48035
file /tmp/gamelog-wr.png  # PNG 1200x630
```

## Change

`GamelogRenderer` passes `position={displayPos}` on `LabOgExportLink` so OG blurb shows `· WR only` and snapshot rows align with in-panel position context (matches buysell/efficiency pattern).

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB, real layout).
