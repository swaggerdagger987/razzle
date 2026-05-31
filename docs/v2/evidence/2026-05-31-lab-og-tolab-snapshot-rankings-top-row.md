# Evidence — lab-og-tolab-snapshot-rankings-top-row

**Date:** 2026-05-31  
**Atom:** Rankings export passes top-row `player_id` into OG URL  
**Verdict:** PASS (Gate C)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 9 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&position=WR&player_id=00-0036900'
# 200 62640

file /tmp/og-rankings.png
# PNG image data, 1200 x 630
```

## Change

`DynastyRankingsRenderer` footer `LabOgExportLink` passes `playerId` + `playerName` from `topPlayer` so OG watermark toLab preserves hallway context for the #1 ranked row.

## Trust

T5 (data fidelity on export), T6 (hallway deep link on share card).
