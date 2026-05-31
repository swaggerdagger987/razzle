# Evidence — Lab L5 player-scoped OG export links

**Date:** 2026-05-31  
**Atom:** `lab-og-export-player-scoped`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-gamelog-chase.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/gamelog?download=1&player_id=00-0036900'
curl -s -o /tmp/og-comps-chase.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/dynasty-comps?download=1&player_id=00-0036900'
```

## Results

| Route | HTTP | Bytes | Format |
|-------|------|-------|--------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 58408 | PNG 1200×630 |
| `/og/dynasty-comps?download=1&player_id=00-0036900` | 200 | 65961 | PNG 1200×630 |

## Gate C

PNG ≥ 40KB with player-scoped query params. In-panel `LabOgExportLink` passes `player_id` from gamelog URL state and dynasty-comps `id` param.
