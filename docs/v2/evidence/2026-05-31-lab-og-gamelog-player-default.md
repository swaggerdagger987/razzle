# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test .venv-v2/bin/pytest apps/api/tests -q   # 60 passed, 2 errors (screener snapshot)
curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
curl -s -o /tmp/og-gamelog-empty.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id='
file /tmp/og-gamelog.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| Gamelog OG no query | `200` PNG ≥40KB |
| Gamelog OG empty player_id | `200` PNG ≥40KB (trim → default) |
| Export link | `LabOgExportLink` sets default for player-scoped slugs |

## Change

`LabOgExportLink` always appends `player_id` for player-scoped panels; `/og/[panel]` treats blank `player_id` as default Chase gsis_id.
