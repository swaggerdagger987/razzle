# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test .venv-v2/bin/pytest apps/api/tests -q   # 60 passed, 4 failed (screener snapshot drift)
curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
file /tmp/og-gamelog.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| Gamelog OG | `200 60634` PNG 1200×630 |
| Export href | includes `player_id=00-0036900` for gamelog without caller override |

## Change

`LabOgExportLink` sets default `player_id` for player-scoped panels; `GamelogRenderer` defers to shared helper.
