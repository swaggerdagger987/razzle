# Evidence — Lab panel share bar weekly + gamelog

**Date:** 2026-05-31  
**Atom:** `lab-panel-share-bar-weekly-gamelog`  
**Verdict:** PASS

## Change

- `WeeklyHeatmapRenderer`: `LabOgExportLink` → `LabPanelShareBar` (empty board + hot-week footer).
- `GamelogRenderer`: player-scoped `LabPanelShareBar` on pick-player, empty weeks, and peak-week footers.

## Commands (executed)

```bash
python3 # inline run test_lab_panel_share_bar.py — 6 tests PASS
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/weekly-og.png -w "%{http_code} %{size_download}" \
  "http://localhost:3000/og/weekly?position=WR&download=1"
# 200 65110

curl -s -o /tmp/gamelog-og.png -w "%{http_code} %{size_download}" \
  "http://localhost:3000/og/gamelog?player_id=00-0036900&download=1"
# 200 61435
```

## Gate C

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/weekly?position=WR&download=1` | 200 | 65110 | yes |
| `/og/gamelog?player_id=00-0036900&download=1` | 200 | 61435 | yes |

## Trust

- **T5:** Export cards match panel snapshot encoding (`encodeOgSnapshot`).
- **T6:** Copy/preview/export chunky buttons — GTM parity with rankings/breakouts.
