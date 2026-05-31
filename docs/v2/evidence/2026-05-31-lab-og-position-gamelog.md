# Evidence — Lab L5 Gamelog OG position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-gamelog`  
**Verdict:** PASS

## Change

`GamelogRenderer.tsx` passes `position={displayPos}` on `LabOgExportLink` so OG blurb matches efficiency/buysell position suffix.

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/gamelog-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&position=WR'
```

## Results

- web build: OK
- curl: `200 48035`
- file: PNG 1200×630
